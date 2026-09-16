import type { NextFunction, Request, Response } from "express";
import { describe, expect, test, vi } from "vitest";

import type { AuthenticatedUser } from "../../schemas";
import { auth } from "./auth";

const conchId = 42;

const createRequest = (user?: AuthenticatedUser) =>
	({
		params: { conchId: conchId.toString() },
		user,
	}) as unknown as Request;

const createResponse = () => {
	const response = {
		status: vi.fn(),
		json: vi.fn(),
	};
	response.status.mockReturnValue(response);
	response.json.mockReturnValue(response);

	return response as unknown as Response;
};

const createUser = (
	appRole: AuthenticatedUser["app_role"] = "standard",
	serverIds: number[] = [],
): AuthenticatedUser => ({
	user_id: 1,
	app_role: appRole,
	serverIds,
});

const runAuth = (
	access: Parameters<typeof auth>[0],
	user?: AuthenticatedUser,
) => {
	const response = createResponse();
	const next = vi.fn() as unknown as NextFunction;

	auth(access)(createRequest(user), response, next);

	return { response, next };
};

describe("auth", () => {
	test("allows unauthenticated access to public routes", () => {
		const { response, next } = runAuth("public");

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});

	test("rejects unauthenticated access to authenticated routes", () => {
		const { response, next } = runAuth("authenticated");

		expect(response.status).toHaveBeenCalledWith(401);
		expect(response.json).toHaveBeenCalledWith({ message: "Unauthorized" });
		expect(next).not.toHaveBeenCalled();
	});

	test("allows a standard user to access authenticated routes", () => {
		const { response, next } = runAuth("authenticated", createUser());

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});

	test("rejects a standard user from admin routes", () => {
		const { response, next } = runAuth("admin", createUser());

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.json).toHaveBeenCalledWith({ message: "Forbidden" });
		expect(next).not.toHaveBeenCalled();
	});

	test("allows an admin user to access admin routes", () => {
		const { response, next } = runAuth("admin", createUser("admin"));

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});

	test("rejects a standard user who is not a member of the requested conch", () => {
		const { response, next } = runAuth("member", createUser("standard", [7]));

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.json).toHaveBeenCalledWith({ message: "Forbidden" });
		expect(next).not.toHaveBeenCalled();
	});

	test("allows a standard user who is a member of the requested conch", () => {
		const { response, next } = runAuth(
			"member",
			createUser("standard", [7, conchId]),
		);

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});

	test("allows an admin user to access member routes without membership", () => {
		const { response, next } = runAuth("member", createUser("admin"));

		expect(next).toHaveBeenCalledOnce();
		expect(response.status).not.toHaveBeenCalled();
	});
});
