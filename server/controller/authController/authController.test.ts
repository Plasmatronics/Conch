import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Request } from "express";
import type { Pool } from "pg";
import z from "zod";
import {
	signupUser,
	loginUser,
	retrieveUser,
	patchUser,
} from "./authController";
import * as passwordUtils from "../../utils/password";

import {
	mockNextFunction,
	mockPool,
	mockRequest,
	mockResponse,
	mockUser,
	normalizeSql,
} from "../../vitest.setup";

import {
	usersTableName,
	usersCreateSchema,
	usersIdColumnName,
} from "../../schemas/Users";
import { AppError } from "../../errors";

const createPasswordSpy = vi.spyOn(passwordUtils, "createPasswordHash");
const checkPasswordSpy = vi.spyOn(passwordUtils, "checkPassword");

const signupHandler = signupUser(mockPool as unknown as Pool);
const loginHandler = loginUser(mockPool as unknown as Pool);
const retrieveUserHandler = retrieveUser(mockPool as unknown as Pool);
const patchUserHandler = patchUser(mockPool as unknown as Pool);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("Signup User", () => {
	const {
		user_id,
		created_at,
		app_role,
		password_hash,
		...signupBodyWithoutPassword
	} = mockUser;

	const signupBodyUser = {
		...signupBodyWithoutPassword,
		password: "test-password",
	};

	let signupRequest: Request;
	beforeEach(() => {
		const { user, ...unauthenticatedMockRequest } = mockRequest as any;

		signupRequest = {
			...unauthenticatedMockRequest,
			body: signupBodyUser,
		} as Request;

		mockPool.query.mockResolvedValue({
			rows: [mockUser],
		});
	});

	test("Signup is queried as expected", async () => {
		await signupHandler(signupRequest, mockResponse, mockNextFunction);

		const passwordHashInjectedPayload = {
			...signupBodyWithoutPassword,
			password_hash:
				createPasswordSpy.mock.results[0]?.value ??
				(await passwordUtils.createPasswordHash(signupBodyUser.password)),
		} as z.infer<typeof usersCreateSchema>;

		const columns = Object.keys(passwordHashInjectedPayload);
		const values = Object.values(passwordHashInjectedPayload);
		const placeholders = values.map((_, i) => `$${i + 1}`);

		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[0][0]);

		const expectedNormalizedQuery = normalizeSql(`
			INSERT INTO ${usersTableName}
			(${columns.join(", ")})
			VALUES (${placeholders.join(", ")})
			RETURNING *
		`);

		expect(normalizedSQLCall).toBe(expectedNormalizedQuery);
	});

	test("User is hydrated upon signup", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [mockUser],
		});
		await signupHandler(signupRequest, mockResponse, mockNextFunction);

		expect(signupRequest.user).toEqual({
			user_id: mockUser[usersIdColumnName],
			app_role: mockUser.app_role,
			serverIds: [],
		});
	});

	test("Invalid signup body is forwarded to next", async () => {
		const { user, ...unauthenticatedMockRequest } = mockRequest as any;
		const invalidRequest = {
			...unauthenticatedMockRequest,
			body: {
				...signupBodyUser,
				email: "not-an-email",
			},
		} as Request;

		await signupHandler(invalidRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(expect.any(Error));
		expect(mockPool.query).not.toHaveBeenCalled();
	});

	test("Signup database errors are forwarded to next", async () => {
		const { user, ...unauthenticatedMockRequest } = mockRequest as any;
		const request = {
			...unauthenticatedMockRequest,
			body: signupBodyUser,
		} as Request;

		const error = new Error("Database failed");
		mockPool.query.mockRejectedValueOnce(error);

		await signupHandler(request, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(error);
	});
});

describe("Login User", () => {
	let loginRequest: Request;
	beforeEach(() => {
		loginRequest = {
			...mockRequest,
			user: undefined,
			body: {
				email: mockUser.email,
				password: "test-password",
			},
		} as Request;

		mockPool.query.mockResolvedValue({
			rows: [mockUser],
			rowCount: 1,
		});
	});

	test("Login queries user by email", async () => {
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[0][0]);

		const expectedNormalizedQuery = normalizeSql(`
			SELECT * FROM ${usersTableName}
			WHERE email = $1
		`);
		expect(normalizedSQLCall).toBe(expectedNormalizedQuery);
		expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
			mockUser.email,
		]);
	});

	test("Login checks password against stored hash", async () => {
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		expect(checkPasswordSpy).toHaveBeenCalledWith(
			"test-password",
			mockUser.password_hash,
		);
	});

	test("User is hydrated upon successful login", async () => {
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		expect(loginRequest.user).toEqual({
			user_id: mockUser[usersIdColumnName],
			app_role: mockUser.app_role,
			serverIds: [],
		});
	});

	test("Login returns 404 when user does not exist", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [],
			rowCount: 0,
		});
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(
			new AppError("Could not find user with those credentials", 404),
		);
	});

	test("Login returns 401 when password is incorrect", async () => {
		const wrongHash =
			await passwordUtils.createPasswordHash("incorrect-password");

		mockPool.query.mockResolvedValueOnce({
			rows: [{ ...mockUser, password_hash: wrongHash }],
			rowCount: 1,
		});
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(
			new AppError("Incorrect credentials", 401),
		);
	});

	test("Login forwards database errors to next", async () => {
		const error = new Error("Database failed");
		mockPool.query.mockRejectedValueOnce(error);
		await loginHandler(loginRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(error);
	});
});

describe("Retrieve User", () => {
	let retrieveRequest: Request;

	beforeEach(() => {
		retrieveRequest = {
			...(mockRequest as any),
			user: {
				user_id: mockUser[usersIdColumnName],
				app_role: mockUser.app_role,
				serverIds: [],
			},
		} as Request;
	});

	test("Retrieve user queries by authenticated user id", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [mockUser],
			rowCount: 1,
		});

		await retrieveUserHandler(retrieveRequest, mockResponse, mockNextFunction);

		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[0][0]);

		const expectedNormalizedQuery = normalizeSql(`
			SELECT * FROM ${usersTableName}
			WHERE ${usersIdColumnName} = $1
		`);

		expect(normalizedSQLCall).toBe(expectedNormalizedQuery);

		expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
			mockUser[usersIdColumnName],
		]);
	});

	test("Retrieve user returns 404 when user is not found", async () => {
		mockPool.query.mockResolvedValueOnce({
			rows: [],
			rowCount: 0,
		});

		await retrieveUserHandler(retrieveRequest, mockResponse, mockNextFunction);
		expect(mockNextFunction).toHaveBeenCalledWith(
			new AppError("Could not retrieve user", 404),
		);
	});

	test("Password hash is omitted from return", async () => {
		await retrieveUserHandler(retrieveRequest, mockResponse, mockNextFunction);

		const { password_hash, ...user } = mockUser;
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			...user,
			created_at: new Date(user.created_at),
		});
	});

	test("Retrieve user forwards database errors to next", async () => {
		const error = new Error("Database failed");
		mockPool.query.mockRejectedValueOnce(error);

		await retrieveUserHandler(retrieveRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(error);
	});
});

describe("Patch User", () => {
	let patchRequest: Request;

	const patchBody = {
		first_name: "Updated",
		last_name: "User",
	};

	beforeEach(() => {
		patchRequest = {
			...(mockRequest as any),
			user: {
				user_id: mockUser[usersIdColumnName],
				app_role: mockUser.app_role,
				serverIds: [],
			},
			body: patchBody,
		} as Request;
	});

	test("Patch user updates expected fields", async () => {
		const updatedUser = {
			...mockUser,
			...patchBody,
		};
		mockPool.query.mockResolvedValueOnce({
			rows: [updatedUser],
		});

		await patchUserHandler(patchRequest, mockResponse, mockNextFunction);

		const normalizedSQLCall = normalizeSql(mockPool.query.mock.calls[0][0]);

		expect(normalizedSQLCall).toContain(
			normalizeSql(`UPDATE ${usersTableName}`),
		);
		expect(normalizedSQLCall).toContain(
			normalizeSql(
				`WHERE ${usersIdColumnName} = '${mockUser[usersIdColumnName]}'`,
			),
		);
	});

	test("Password hash is omitted from return", async () => {
		await patchUserHandler(patchRequest, mockResponse, mockNextFunction);

		const { password_hash, ...user } = mockUser;
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({
			...user,
			created_at: new Date(user.created_at),
		});
	});

	test("Patch user rejects when no fields are provided", async () => {
		patchRequest.body = {};

		await patchUserHandler(patchRequest, mockResponse, mockNextFunction);

		expect(mockPool.query).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
	});

	test("Patch user forwards database errors to next", async () => {
		const error = new Error("Database failed");

		mockPool.query.mockRejectedValueOnce(error);

		await patchUserHandler(patchRequest, mockResponse, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledWith(error);
	});
});
