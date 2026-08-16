/* eslint-disable  @typescript-eslint/no-explicit-any */

import { vi } from "vitest";
import { Users, usersIdColumnName, usersSchema } from "./schemas/Users";
import { CookieOptions, NextFunction, Response, Request } from "express";
import { Sessions, sessionsSchema } from "./schemas/Sessions";

export const mockPool = {
	on: vi.fn(),
	query: vi.fn(),
	end: vi.fn(),
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
	status: vi.fn(),
} as unknown as Response;
export const mockNextFunction = vi.fn() as unknown as NextFunction;

const mockUserId = 976341942;
const mockSessionId = 482046382;

export const mockUser: Users = {
	user_id: mockUserId,
	first_name: "test-first-name",
	last_name: "test-last-name",
	email: "test@gmail.com",
	phone_number: "555-555-5555",
	password_hash: "4E33fE3rl09",
	created_at: new Date(),
	app_role: "standard" as const,
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
