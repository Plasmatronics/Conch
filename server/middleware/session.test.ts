import { beforeEach, describe, expect, test, vi } from "vitest";
import * as session from "./session";
import { Response } from "express";

import { sessionsIdColumnName, sessionsTableName } from "../schemas/Sessions";

import { Pool } from "pg";
import { daysToMs } from "../utils/daysToMs";
import {
	mockNextFunction,
	mockRequest,
	mockResponse,
	mockSession,
	mockUser,
	sessionsParseSpy,
	usersParseSpy,
	normalizeSql,
	mockParsedUser,
} from "../vitest.setup";

const mockPool = {
	query: vi.fn(),
};

const hashSessionTokenSpy = vi.spyOn(session, "hashSessionToken");

const createSessionHandler = session.createSession(mockPool as unknown as Pool);
const verifySessionHandler = session.verifySession(mockPool as unknown as Pool);
const revokeSessionHandler = session.revokeSession(mockPool as unknown as Pool);

beforeEach(async () => {
	vi.clearAllMocks();
	vi.mocked(mockPool.query).mockReset();
});

describe("Session Creation", () => {
	beforeEach(async () => {
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [],
			rowCount: 1,
		});

		await createSessionHandler(mockRequest, mockResponse, mockNextFunction);
	});

	test("hashing function is deterministic", async () => {
		const cookie = (mockResponse as any).session_token[0];
		expect(hashSessionTokenSpy).returned(session.hashSessionToken(cookie));
	});

	test("hashing function returns the expected SHA-256 digest", () => {
		expect(session.hashSessionToken("hello")).toBe(
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
	});

	test("Fails gracefully", async () => {
		vi.mocked(mockPool.query).mockResolvedValueOnce({ rows: [], rowCount: 0 });

		await createSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockNextFunction).toHaveBeenCalledWith(
			expect.objectContaining({
				message: "Failed to create session",
			}),
		);
	});
});

describe("Session Verification", () => {
	const refreshExtensionNumDays = 30;
	const expireDate = new Date(Date.now() + daysToMs(refreshExtensionNumDays));
	const refreshedMockSession = {
		...mockSession,
		expire_time: expireDate,
		absolute_expire_time: expireDate,
	};

	beforeEach(async () => {
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [{ mockUser, refreshedMockSession }],
			rowCount: 2,
		});

		vi.mocked(usersParseSpy).mockReturnValue(mockParsedUser);
		vi.mocked(sessionsParseSpy).mockReturnValue(refreshedMockSession);

		await verifySessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);
	});

	test("Refresh operates as expected", async () => {
		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[1][0]);
		const sqlParams = mockPool.query.mock.calls[1][1];

		const expectedNormalizedQuery = normalizeSql(`
			UPDATE ${sessionsTableName}
			SET expire_time = $1
			WHERE ${sessionsIdColumnName} = $2
			`);

		expect(normalizedSQLCall).toBe(expectedNormalizedQuery);
		expect(sqlParams).toEqual(
			expect.arrayContaining([expireDate, mockSession[sessionsIdColumnName]]),
		);
	});

	test("Expired token rejects", async () => {
		const expiredDate = new Date(Date.now() - 1);
		const expiredSession = {
			...mockSession,
			expire_time: expiredDate,
			absolute_expire_time: expiredDate,
		};
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [
				{
					mockUser,
					session: expiredSession,
				},
			],
			rowCount: 2,
		});

		vi.mocked(usersParseSpy).mockReturnValue(mockParsedUser);
		vi.mocked(sessionsParseSpy).mockReturnValue(expiredSession);

		await verifySessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(401);
	});

	test("Missing session token rejects", async () => {
		const originalToken = mockRequest.cookies.session_token;
		delete mockRequest.cookies.session_token;

		await verifySessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(404);

		mockRequest.cookies.session_token = originalToken;
	});

	test("Invalid session rejects", async () => {
		vi.mocked(mockPool.query).mockResolvedValueOnce({
			rows: [],
			rowCount: 0,
		});

		await verifySessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(404);
	});

	test("Failed session refresh rejects", async () => {
		vi.mocked(mockPool.query)
			.mockResolvedValueOnce({
				rows: [{ mockUser, session }],
				rowCount: 1,
			})
			.mockResolvedValueOnce({
				rows: [],
				rowCount: 0,
			});

		await verifySessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockResponse.status).toHaveBeenCalledWith(500);
	});
});

describe("Session Revokation", () => {
	test("Session is deleted", async () => {
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [],
			rowCount: 1,
		});

		await revokeSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[0][0]);

		const expectedNormalizedQuery = normalizeSql(`
			DELETE FROM ${sessionsTableName}
			WHERE session_token_hash = $1
		`);

		expect(normalizedSQLCall).toBe(expectedNormalizedQuery);

		expect(mockPool.query.mock.calls[0][1]).toEqual([
			session.hashSessionToken("test-session-token"),
		]);
	});

	test("Session cookie is cleared", async () => {
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [],
			rowCount: 1,
		});

		await revokeSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect((mockResponse as any).session_token).toBeUndefined();
		expect(mockNextFunction).toHaveBeenCalled();
	});

	test("Missing session token does not query database", async () => {
		const originalToken = mockRequest.cookies.session_token;
		delete mockRequest.cookies.session_token;

		await revokeSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalled();

		mockRequest.cookies.session_token = originalToken;
	});

	test("Database error is passed to next", async () => {
		const error = new Error("Database error");

		vi.mocked(mockPool.query).mockRejectedValueOnce(error);

		await revokeSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);

		expect(mockNextFunction).toHaveBeenCalledWith(error);
	});
});
