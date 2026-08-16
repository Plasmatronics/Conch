//need to use any to bypass private properties and test/examine them

import { beforeEach, describe, expect, test, vi } from "vitest";
import * as session from "./session";
import { CookieOptions, NextFunction, Request, Response } from "express";

import { usersSchema, usersIdColumnName } from "../schemas/Users";
import {
	sessionsSchema,
	sessionsIdColumnName,
	sessionsTableName,
} from "../schemas/Sessions";

import { Pool } from "pg";
import { normalizeSql } from "../utils/normalizeSQLForVItest";
import { daysToMs } from "../utils/daysToMs";

const mockRequest = {
	user: {
		[usersIdColumnName]: "test-user-id",
	},
	cookies: {
		session_token: "test-session-token",
	},
} as unknown as Request;
const mockResponse: Record<string, any> = {
	cookie(key: string, value: string, options: CookieOptions) {
		mockResponse[key] = [value, options];
	},
	clearCookie(key: string, _options: CookieOptions) {
		if (key in mockResponse) delete mockResponse[key];
	},
	status: vi.fn(),
};
const mockNextFunction = vi.fn() as unknown as NextFunction;

const mockPool = {
	query: vi.fn(),
};
vi.mock("pg", () => {
	class MockPool {
		constructor() {
			return mockPool;
		}
	}

	return { Pool: MockPool };
});
vi.mock("../utils/appEnvVariables", () => ({
	appEnvVariables: {
		devPort: "3000",
		secretId: "test-secret-id",
		accessKeyId: "test-access-key",
		secretAccessKey: "test-secret-key",
		db: "test-db",
		host: "localhost",
		rdsPortStr: "5432",
		region: "us-east-1",
		caCertPath: "test-cert.pem",
		apiPrefix: "/api",
		nodeEnv: "test",
	},
}));

const usersParseSpy = vi.spyOn(usersSchema, "parse");
const sessionsParseSpy = vi.spyOn(sessionsSchema, "parse");

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

		await createSessionHandler(
			mockRequest,
			mockResponse as unknown as Response,
			mockNextFunction,
		);
	});

	test("hashing function is deterministic", async () => {
		const cookie = mockResponse.session_token[0];
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
	const userId = 976341942;
	const sessionId = 482046382;
	const user = {
		user_id: userId,
		first_name: "test-first-name",
		last_name: "test-last-name",
		email: "test@gmail.com",
		phone_number: "555-555-5555",
		password_hash: "4E33fE3rl09",
		created_at: new Date(),
		app_role: "standard" as const,
		deleted_date: null,
	};
	const session = {
		session_id: sessionId,
		session_token_hash: "4Rt0fE3rl09",
		user_id: userId,
		expire_time: expireDate,
		absolute_expire_time: expireDate,
	};

	beforeEach(async () => {
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [{ user, session }],
			rowCount: 2,
		});

		vi.mocked(usersParseSpy).mockReturnValue(user);
		vi.mocked(sessionsParseSpy).mockReturnValue(session);

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
		expect(sqlParams).toEqual(expect.arrayContaining([expireDate, sessionId]));
	});

	test("Expired token rejects", async () => {
		const expiredDate = new Date(Date.now() - 1);
		const expiredSession = {
			...session,
			expire_time: expiredDate,
			absolute_expire_time: expiredDate,
		};
		vi.mocked(mockPool.query).mockResolvedValue({
			rows: [
				{
					user,
					session: expiredSession,
				},
			],
			rowCount: 2,
		});

		vi.mocked(usersParseSpy).mockReturnValue(user);
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
				rows: [{ user, session }],
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

		expect(mockResponse.session_token).toBeUndefined();
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
