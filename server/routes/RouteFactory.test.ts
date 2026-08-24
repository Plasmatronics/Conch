import { beforeEach, describe, expect, test, vi } from "vitest";
import express, {
	type NextFunction,
	type Request,
	type RequestHandler,
	type Response,
} from "express";
import request from "supertest";

import { RouteFactory } from "./RouteFactory";
import type { Controllers } from "../controller";
import { mockPool } from "../vitest.setup";
import { auth, errorHandlerMiddleware, verifySession } from "../middleware";
import type { RouteAccessConfig } from "../types";
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
) => next();

const createControllers = (): Controllers => ({
	getAll: vi.fn((_req, res) => res.status(200).json({ handler: "getAll" })),
	get: vi.fn((_req, res) => res.status(200).json({ handler: "get" })),
	post: vi.fn((_req, res) => res.status(201).json({ handler: "post" })),
	patch: vi.fn((_req, res) => res.status(200).json({ handler: "patch" })),
	delete: vi.fn((_req, res) => res.status(200).json({ handler: "delete" })),
});

const createApp = (
	controllers: Controllers,
	accessConfig: RouteAccessConfig = {
		getAll: "member",
		get: "member",
		post: "member",
		patch: "member",
		delete: "member",
	},
) => {
	const app = express();
	app.use(express.json());
	app.use(
		"/users",
		new RouteFactory(mockPool as never).createRoutes(accessConfig, controllers),
	);
	app.use(errorHandlerMiddleware);
	return app;
};

beforeEach(() => {
	vi.clearAllMocks();
	mockAuth.mockReturnValue(passthroughMiddleware as any);
	mockVerifySession.mockReturnValue(passthroughMiddleware as any);
});

describe("RouteFactory", () => {
	describe("middleware configuration", () => {
		test("adds session verification to protected routes", () => {
			createApp(createControllers(), {
				getAll: "member",
				get: "member",
				post: "member",
				patch: "member",
				delete: "member",
			});

			expect(mockVerifySession).toHaveBeenCalledTimes(5);
			expect(mockVerifySession).toHaveBeenCalledWith(mockPool);
		});

		test("does not verify sessions for public routes", () => {
			createApp(createControllers(), {
				getAll: "public",
				get: "public",
				post: "public",
				patch: "public",
				delete: "public",
			});

			expect(mockVerifySession).not.toHaveBeenCalled();
			expect(mockAuth).toHaveBeenCalledTimes(5);
		});

		test("configures auth in route order", () => {
			createApp(createControllers(), {
				getAll: "public",
				get: "member",
				post: "member",
				patch: "admin",
				delete: "public",
			});

			expect(mockAuth.mock.calls).toEqual([
				["public"],
				["member"],
				["member"],
				["admin"],
				["public"],
			]);
		});
	});

	describe("controller dispatch", () => {
		test("dispatches each route to the injected controller", async () => {
			const controllers = createControllers();
			const app = createApp(controllers);

			const responses = await Promise.all([
				request(app).get("/users"),
				request(app).get("/users/42"),
				request(app).post("/users").send({ name: "John" }),
				request(app).patch("/users/42").send({ name: "Updated" }),
				request(app).delete("/users/42"),
			]);

			expect(responses.map((response) => response.status)).toEqual([
				200, 200, 201, 200, 200,
			]);
			expect(controllers.getAll).toHaveBeenCalledOnce();
			expect(controllers.get).toHaveBeenCalledOnce();
			expect(controllers.post).toHaveBeenCalledOnce();
			expect(controllers.patch).toHaveBeenCalledOnce();
			expect(controllers.delete).toHaveBeenCalledOnce();
		});

		test("passes resource IDs through request params", async () => {
			const controllers = createControllers();
			await request(createApp(controllers)).get("/users/42");

			expect(controllers.get).toHaveBeenCalledWith(
				expect.objectContaining({ params: { id: "42" } }),
				expect.anything(),
				expect.anything(),
			);
		});

		test("forwards invalid resource IDs to the controller", async () => {
			const controllers = createControllers();
			await request(createApp(controllers)).get("/users/not-a-number");

			expect(controllers.get).toHaveBeenCalledWith(
				expect.objectContaining({ params: { id: "not-a-number" } }),
				expect.anything(),
				expect.anything(),
			);
		});
	});

	describe("error forwarding", () => {
		test("forwards controller errors to the application error handler", async () => {
			const controllers = createControllers();
			const error = new AppError("controller failed", 500);
			vi.mocked(controllers.getAll).mockImplementationOnce((_req, _res, next) =>
				next(error),
			);

			const response = await request(createApp(controllers)).get("/users");

			expect(response.status).toBe(500);
			expect(response.body.message).toBe("controller failed");
		});
	});
});
