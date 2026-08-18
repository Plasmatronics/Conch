/* eslint-disable  @typescript-eslint/no-explicit-any */

import { vi } from "vitest";
import { Users, usersIdColumnName, usersSchema } from "./schemas/Users";
import { CookieOptions, NextFunction, Response, Request } from "express";
import { Sessions, sessionsSchema } from "./schemas/Sessions";

vi.mock("./appEnvVariables", () => ({
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

export const mockPoolClient = {
	query: vi.fn(),
	release: vi.fn(),
};

export const mockPool = {
	on: vi.fn(),
	query: vi.fn(),
	end: vi.fn(),
	connect: vi.fn(),
};

vi.mock("pg", () => {
	class MockPool {
		constructor() {
			return mockPool;
		}
	}

	return { Pool: MockPool };
});

export const mockRequest = {
	user: {
		[usersIdColumnName]: "test-user-id",
	},
	cookies: {
		session_token: "test-session-token",
	},
} as unknown as Request;
export const mockResponse = {
	cookie(key: string, value: string, options: CookieOptions) {
		(mockResponse as any)[key] = [value, options];
	},
	clearCookie(key: string, _options: CookieOptions) {
		if (key in mockResponse) delete (mockResponse as any)[key];
	},
	status: vi.fn().mockReturnThis(),
	json: vi.fn().mockReturnThis(),
} as unknown as Response;
export const mockNextFunction = vi.fn() as unknown as NextFunction;

export const mockUserId = 976341942;
export const mockSessionId = 482046382;

export const mockUser: Omit<Users, "created_at"> & { created_at: string } = {
	user_id: mockUserId,
	first_name: "test-first-name",
	last_name: "test-last-name",
	email: "test@gmail.com",
	phone_number: "555-555-5555",
	password_hash: "$2b$10$5P5tiz5U8qxpkSQAHI613O2AQLqtP0AXpr.3bJenmKFJizFO/qwP2",
	created_at: new Date().toISOString(),
	app_role: "standard" as const,
};

export const mockParsedUser: Users = {
	...mockUser,
	created_at: new Date(),
};
export const mockSession: Sessions = {
	session_id: mockSessionId,
	session_token_hash: "4Rt0fE3rl09",
	user_id: mockUserId,
	expire_time: new Date(),
	absolute_expire_time: new Date(),
};

export const usersParseSpy = vi.spyOn(usersSchema, "parse");
export const sessionsParseSpy = vi.spyOn(sessionsSchema, "parse");

export const normalizeSql = (sql: string) => sql.replace(/\s+/g, " ").trim();
