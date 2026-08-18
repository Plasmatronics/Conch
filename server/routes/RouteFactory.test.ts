import { beforeEach, describe, expect, test, vi } from "vitest";
import express, {
	type NextFunction,
	type Request,
	type RequestHandler,
	type Response,
} from "express";
import request from "supertest";
import z from "zod";

import { RouteFactory } from "./RouteFactory";
import type { CRUDFactory } from "../queries";
import { mockPool } from "../vitest.setup";
import { auth, errorHandlerMiddleware, verifySession } from "../middleware";
import { RouteAccessConfig } from "../types";
import { AppError } from "../errors";

vi.mock("../middleware", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../middleware")>();

	return {
		...actual,
		auth: vi.fn(),
		verifySession: vi.fn(),
	};
});
const mockAuth = vi.mocked(auth);
const mockVerifySession = vi.mocked(verifySession);

const passthroughMiddleware: RequestHandler = (
	_req: Request,
	_res: Response,
	next: NextFunction,
) => {
	next();
};

const mockCrudFactory = {
	generateGetAll: vi.fn(),
	generateGetOne: vi.fn(),
	generateCreateOne: vi.fn(),
	generateUpdateOne: vi.fn(),
	generateDeleteOne: vi.fn(),
} as unknown as CRUDFactory;

const createSchema = z.object({
	name: z.string(),
});
const updateSchema = z.object({
	name: z.string().optional(),
});

const createFactory = () =>
	new RouteFactory(
		"users",
		mockPool as never,
		"user_id",
		mockCrudFactory,
		createSchema,
		updateSchema,
	);

const createApp = (routeConfig: RouteAccessConfig = {}) => {
	const app = express();
	app.use(express.json());

	const factory = createFactory();
	app.use("/users", factory.createRoutes(routeConfig));
	app.use(errorHandlerMiddleware);

	return app;
};

beforeEach(() => {
	vi.clearAllMocks();

	mockAuth.mockReturnValue(passthroughMiddleware as any);
	mockVerifySession.mockReturnValue(passthroughMiddleware as any);

	mockPool.query.mockResolvedValue({
		rows: [],
	});

	vi.mocked(mockCrudFactory.generateGetAll).mockReturnValue({
		text: "SELECT * FROM users",
		values: [],
	});
	vi.mocked(mockCrudFactory.generateGetOne).mockReturnValue({
		text: "SELECT * FROM users WHERE user_id = $1",
		values: ["1"],
	});
	vi.mocked(mockCrudFactory.generateCreateOne).mockReturnValue({
		text: "INSERT INTO users (name) VALUES ($1) RETURNING *",
		values: ["John"],
	});
	vi.mocked(mockCrudFactory.generateUpdateOne).mockReturnValue({
		text: "UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *",
		values: ["John", "1"],
	});
	vi.mocked(mockCrudFactory.generateDeleteOne).mockReturnValue({
		text: "DELETE FROM users WHERE user_id = $1 RETURNING *",
		values: ["1"],
	});
});

describe("RouteFactory", () => {
	describe("middleware configuration", () => {
		test("adds verifySession to protected routes", () => {
			createApp();

			expect(mockVerifySession).toHaveBeenCalledWith(mockPool);
			expect(mockAuth).toHaveBeenCalledWith("member");
		});

		test("does not add verifySession to public GET all route", () => {
			createApp({
				getAllRoute: "public",
			});

			expect(mockAuth).toHaveBeenCalledWith("public");
		});

		test("configures auth using the specified access levels", () => {
			createApp({
				getRoute: "admin",
				getAllRoute: "public",
				postRoute: "admin",
				patchRoute: "member",
				deleteRoute: "admin",
			});

			expect(mockAuth.mock.calls).toEqual([
				["public"],
				["admin"],
				["admin"],
				["member"],
				["admin"],
			]);
		});
	});

	describe("GET /", () => {
		test("retrieves all resources", async () => {
			const users = [
				{ user_id: 1, name: "John" },
				{ user_id: 2, name: "Jane" },
			];
			mockPool.query.mockResolvedValue({
				rows: users,
			});

			const app = createApp();
			const response = await request(app).get("/users");

			expect(mockCrudFactory.generateGetAll).toHaveBeenCalledWith("users");

			expect(mockPool.query).toHaveBeenCalledWith("SELECT * FROM users", []);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(users);
		});

		test("returns an empty array when the query returns no rows", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
			});

			const response = await request(createApp()).get("/users");

			expect(response.status).toBe(200);
			expect(response.body).toEqual([]);
		});

		test("forwards database errors", async () => {
			mockPool.query.mockRejectedValue(
				new AppError("database unavailable", 500),
			);

			const response = await request(createApp()).get("/users");

			expect(response.status).toBe(500);
			expect(response.body.message).toBe("database unavailable");
		});
	});

	describe("POST /", () => {
		test("validates the request body and creates a resource", async () => {
			const createdUser = {
				user_id: 1,
				name: "John",
			};

			mockPool.query.mockResolvedValue({
				rows: [createdUser],
			});

			const response = await request(createApp()).post("/users").send({
				name: "John",
			});

			expect(mockCrudFactory.generateCreateOne).toHaveBeenCalledWith("users", {
				name: "John",
			});

			expect(mockPool.query).toHaveBeenCalledWith(
				"INSERT INTO users (name) VALUES ($1) RETURNING *",
				["John"],
			);

			expect(response.status).toBe(201);
			expect(response.body).toEqual(createdUser);
		});

		test("does not execute a query when request body validation fails", async () => {
			const response = await request(createApp()).post("/users").send({
				name: 123,
			});

			expect(response.status).toBe(400);

			expect(mockCrudFactory.generateCreateOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
		});

		test("forwards create query errors", async () => {
			mockPool.query.mockRejectedValue(new AppError("insert failed", 500));

			const response = await request(createApp()).post("/users").send({
				name: "John",
			});

			expect(response.status).toBe(500);
			expect(response.body.message).toBe("insert failed");
		});
	});

	describe("GET /:id", () => {
		test("retrieves one resource", async () => {
			const user = {
				user_id: 42,
				name: "John",
			};

			vi.mocked(mockCrudFactory.generateGetOne).mockReturnValue({
				text: "SELECT * FROM users WHERE user_id = $1",
				values: ["42"],
			});

			mockPool.query.mockResolvedValue({
				rows: [user],
			});

			const response = await request(createApp()).get("/users/42");

			expect(mockCrudFactory.generateGetOne).toHaveBeenCalledWith(
				"users",
				"user_id",
				"42",
			);

			expect(mockPool.query).toHaveBeenCalledWith(
				"SELECT * FROM users WHERE user_id = $1",
				["42"],
			);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(user);
		});

		test("rejects a non-numeric resource ID", async () => {
			const response = await request(createApp()).get("/users/not-a-number");

			expect(response.status).toBe(400);

			expect(mockCrudFactory.generateGetOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
		});

		test("returns 404 when the resource does not exist", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
			});

			const response = await request(createApp()).get("/users/42");

			expect(response.status).toBe(404);
			expect(response.body.message).toBe("users with ID 42 not found.");
		});
	});

	describe("PATCH /:id", () => {
		test("validates and updates a resource", async () => {
			const updatedUser = {
				user_id: 42,
				name: "Updated",
			};

			vi.mocked(mockCrudFactory.generateUpdateOne).mockReturnValue({
				text: "UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *",
				values: ["Updated", "42"],
			});

			mockPool.query.mockResolvedValue({
				rows: [updatedUser],
			});

			const response = await request(createApp()).patch("/users/42").send({
				name: "Updated",
			});

			expect(mockCrudFactory.generateUpdateOne).toHaveBeenCalledWith(
				"users",
				{
					name: "Updated",
				},
				"user_id",
				"42",
			);

			expect(mockPool.query).toHaveBeenCalledWith(
				"UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *",
				["Updated", "42"],
			);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(updatedUser);
		});

		test("does not execute update query when body validation fails", async () => {
			const response = await request(createApp()).patch("/users/42").send({
				name: 123,
			});

			expect(response.status).toBe(400);

			expect(mockCrudFactory.generateUpdateOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
		});

		test("returns 404 when the resource to update does not exist", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
			});

			const response = await request(createApp()).patch("/users/42").send({
				name: "Updated",
			});

			expect(response.status).toBe(404);
			expect(response.body.message).toBe("users with ID 42 not found.");
		});
	});

	describe("DELETE /:id", () => {
		test("deletes a resource", async () => {
			const deletedUser = {
				user_id: 42,
				name: "John",
			};

			vi.mocked(mockCrudFactory.generateDeleteOne).mockReturnValue({
				text: "DELETE FROM users WHERE user_id = $1 RETURNING *",
				values: ["42"],
			});

			mockPool.query.mockResolvedValue({
				rows: [deletedUser],
			});

			const response = await request(createApp()).delete("/users/42");

			expect(mockCrudFactory.generateDeleteOne).toHaveBeenCalledWith(
				"users",
				"user_id",
				"42",
			);

			expect(mockPool.query).toHaveBeenCalledWith(
				"DELETE FROM users WHERE user_id = $1 RETURNING *",
				["42"],
			);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(deletedUser);
		});

		test("returns 404 when the resource to delete does not exist", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
			});

			const response = await request(createApp()).delete("/users/42");

			expect(response.status).toBe(404);
			expect(response.body.message).toBe("users with ID 42 not found.");
		});

		test("does not execute deletion for an invalid ID", async () => {
			const response = await request(createApp()).delete("/users/invalid");

			expect(response.status).toBe(400);

			expect(mockCrudFactory.generateDeleteOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
		});
	});
});
