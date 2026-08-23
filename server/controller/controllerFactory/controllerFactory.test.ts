import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Request, Response } from "express";
import type { Pool } from "pg";
import { z } from "zod";

import { ControllerFactory } from "./controllerFactory";
import type { CRUDFactory } from "../../queries";
import { AppError } from "../../errors";
import { mockNextFunction, mockPool, mockResponse } from "../../vitest.setup";

const tableName = "users";
const idColumnName = "user_id";
const resourceId = 42;
const conchId = 7;
const resource = { user_id: resourceId, name: "John" };

const createSchema = z.object({
	name: z.string(),
});
const updateSchema = z.object({
	name: z.string().optional(),
});
const tableSchema = z.object({
	user_id: z.number(),
	name: z.string(),
});

const mockCrudFactory = {
	generateGetAll: vi.fn(),
	generateGetOne: vi.fn(),
	generateCreateOne: vi.fn(),
	generateUpdateOne: vi.fn(),
	generateDeleteOne: vi.fn(),
} as unknown as CRUDFactory;

const createRequest = (
	body: unknown = {},
	params = {
		userId: String(resourceId),
		conchId: String(conchId),
	},
) => ({ body, params }) as any as Request;

const createResponse = () =>
	({
		...mockResponse,
	}) as unknown as Response;

const createFactory = () =>
	new ControllerFactory({
		dbPool: mockPool as unknown as Pool,
		crudFactory: mockCrudFactory,
		createSchema,
		updateSchema,
		tableSchema,
		conchScoped: true,
		idParamName: "userId",
	});

let controllers: ReturnType<ControllerFactory["createControllers"]>;

beforeEach(() => {
	vi.clearAllMocks();
	controllers = createFactory().createControllers();
	mockPool.query.mockResolvedValue({ rows: [resource], rowCount: 1 });

	vi.mocked(mockCrudFactory.generateGetAll).mockReturnValue({
		text: "SELECT * FROM users",
		values: [conchId],
	});
	vi.mocked(mockCrudFactory.generateGetOne).mockReturnValue({
		text: "SELECT * FROM users WHERE user_id = $1",
		values: [resourceId, conchId],
	});
	vi.mocked(mockCrudFactory.generateCreateOne).mockReturnValue({
		text: "INSERT INTO users (name) VALUES ($1) RETURNING *",
		values: ["John", conchId],
	});
	vi.mocked(mockCrudFactory.generateUpdateOne).mockReturnValue({
		text: "UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *",
		values: ["John", resourceId, conchId],
	});
	vi.mocked(mockCrudFactory.generateDeleteOne).mockReturnValue({
		text: "DELETE FROM users WHERE user_id = $1 RETURNING *",
		values: [resourceId, conchId],
	});
});

describe("ControllerFactory", () => {
	test("creates a controller for each CRUD operation", () => {
		expect(Object.keys(controllers)).toEqual([
			"getAll",
			"get",
			"patch",
			"post",
			"delete",
		]);
	});

	describe("getAll", () => {
		test("retrieves all rows and returns them with status 200", async () => {
			const response = createResponse();

			await controllers.getAll(createRequest(), response, mockNextFunction);

			expect(mockCrudFactory.generateGetAll).toHaveBeenCalledWith(conchId);
			expect(mockPool.query).toHaveBeenCalledWith("SELECT * FROM users", [
				conchId,
			]);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith([resource]);
		});

		test("forwards invalid query results to next", async () => {
			mockPool.query.mockResolvedValue({});

			await controllers.getAll(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards invalid database rows to next", async () => {
			mockPool.query.mockResolvedValue({
				rows: [{ user_id: resourceId, name: 123 }],
			});

			await controllers.getAll(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards database errors to next", async () => {
			const error = new Error("database unavailable");
			mockPool.query.mockRejectedValue(error);

			await controllers.getAll(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});

	describe("post", () => {
		test("validates, creates, and returns the first row with status 201", async () => {
			const response = createResponse();

			await controllers.post(
				createRequest({ name: "John" }),
				response,
				mockNextFunction,
			);

			expect(mockCrudFactory.generateCreateOne).toHaveBeenCalledWith(
				{ name: "John" },
				conchId,
			);
			expect(mockPool.query).toHaveBeenCalledWith(
				"INSERT INTO users (name) VALUES ($1) RETURNING *",
				["John", conchId],
			);
			expect(response.status).toHaveBeenCalledWith(201);
			expect(response.json).toHaveBeenCalledWith(resource);
		});

		test("does not create a row when body validation fails", async () => {
			await controllers.post(
				createRequest({ name: 123 }),
				createResponse(),
				mockNextFunction,
			);

			expect(mockCrudFactory.generateCreateOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards creation database errors to next", async () => {
			const error = new Error("insert failed");
			mockPool.query.mockRejectedValue(error);

			await controllers.post(
				createRequest({ name: "John" }),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});

	describe("get", () => {
		test("parses the userId parameter and passes it to CRUD as resourceId", async () => {
			const response = createResponse();

			await controllers.get(createRequest(), response, mockNextFunction);

			expect(mockCrudFactory.generateGetOne).toHaveBeenCalledWith(
				resourceId,
				conchId,
			);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(resource);
		});

		test("rejects an invalid resource ID before querying", async () => {
			await controllers.get(
				createRequest({}, { userId: "not-a-number" } as any),
				createResponse(),
				mockNextFunction,
			);

			expect(mockCrudFactory.generateGetOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("returns 404 when the resource does not exist", async () => {
			mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

			await controllers.get(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Resource with ID 42 not found.", 404),
			);
		});

		test("forwards retrieval database errors to next", async () => {
			const error = new Error("query failed");
			mockPool.query.mockRejectedValue(error);

			await controllers.get(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});

	describe("patch", () => {
		test("validates and updates a resource", async () => {
			const response = createResponse();

			await controllers.patch(
				createRequest({ name: "John" }),
				response,
				mockNextFunction,
			);

			expect(mockCrudFactory.generateUpdateOne).toHaveBeenCalledWith(
				{ name: "John" },
				resourceId,
				conchId,
			);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(resource);
		});

		test("does not update a row when body validation fails", async () => {
			await controllers.patch(
				createRequest({ name: 123 }),
				createResponse(),
				mockNextFunction,
			);

			expect(mockCrudFactory.generateUpdateOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("rejects an invalid resource ID before updating", async () => {
			await controllers.patch(
				createRequest({ name: "Updated" }, { userId: "0" } as any),
				createResponse(),
				mockNextFunction,
			);

			expect(mockCrudFactory.generateUpdateOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("returns 404 when the resource to update does not exist", async () => {
			mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

			await controllers.patch(
				createRequest({ name: "Updated" }),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Resource with ID 42 not found.", 404),
			);
		});
	});

	describe("delete", () => {
		test("deletes a resource and returns the deleted row", async () => {
			const response = createResponse();

			await controllers.delete(createRequest(), response, mockNextFunction);

			expect(mockCrudFactory.generateDeleteOne).toHaveBeenCalledWith(
				resourceId,
				conchId,
			);
			expect(response.status).toHaveBeenCalledWith(200);
			expect(response.json).toHaveBeenCalledWith(resource);
		});

		test("returns 404 when the resource to delete does not exist", async () => {
			mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

			await controllers.delete(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Resource with ID 42 not found.", 404),
			);
		});

		test("rejects an invalid resource ID before deleting", async () => {
			await controllers.delete(
				createRequest({}, { userId: "-1" } as any),
				createResponse(),
				mockNextFunction,
			);

			expect(mockCrudFactory.generateDeleteOne).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards deletion database errors to next", async () => {
			const error = new Error("delete failed");
			mockPool.query.mockRejectedValue(error);

			await controllers.delete(
				createRequest(),
				createResponse(),
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});
});
