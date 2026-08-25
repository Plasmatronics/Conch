import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Request, Response } from "express";
import z from "zod";

import {
	mockPool,
	mockResponse as defaultResponse,
	mockNextFunction,
	normalizeSql,
} from "../../vitest.setup";
import {
	createConch,
	deleteConch,
	getAllPersonalConches,
	getConch,
	updateConch,
} from "./conchController";
import {
	conchesIdColumnName,
	conchesSchema,
	conchesTableName,
	usersIdColumnName,
	conchesCreateSchema,
	conchesUpdateSchema,
} from "../../schemas";
import { getConchFromDb } from "../../queries";
import { Pool } from "pg";

vi.mock("../../queries", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../../queries")>();

	return {
		...actual,
		getConchFromDb: vi.fn(),
	};
});

const mockGetConchFromDb = vi.mocked(getConchFromDb);

const mockUserId = 123;
const mockConchId = 456;

const mockConch = {
	conch_id: mockConchId,
	conch_name: "Test Conch",
	admin_id: mockUserId,
	confirmations_needed_for_referrals: 2,
};

const mockRequest = {
	body: {},
	user: {
		[usersIdColumnName]: mockUserId,
		serverIds: [1, 2, 3],
	},
} as unknown as Request;

const mockResponse = {
	...defaultResponse,
	locals: {
		conchId: mockConchId,
	},
} as unknown as Response;

beforeEach(() => {
	vi.clearAllMocks();

	mockPool.query.mockResolvedValue({
		rows: [],
		rowCount: 0,
	});

	mockGetConchFromDb.mockResolvedValue(
		mockConch as unknown as z.infer<typeof conchesSchema>,
	);

	mockRequest.body = {};
});

const createConchHandler = createConch(mockPool as unknown as Pool);
const deleteConchHandler = deleteConch(mockPool as unknown as Pool);
const getAllPersonalConchesHandler = getAllPersonalConches(
	mockPool as unknown as Pool,
);
const updateConchHandler = updateConch(mockPool as unknown as Pool);
const getConchHandler = getConch(mockPool as unknown as Pool);

describe("conchController", () => {
	describe("createConch", () => {
		beforeEach(() => {
			const creationBody = conchesCreateSchema.parse({ ...mockConch });
			mockRequest.body = {
				...creationBody,
			};
		});

		test("creates a conch using the authenticated user as admin", async () => {
			const date = new Date();

			mockPool.query.mockResolvedValue({
				rows: [{ ...mockConch, created_at: date.toISOString() }],
				rowCount: 1,
			});

			await createConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockPool.query).toHaveBeenCalledOnce();

			const [query] = mockPool.query.mock.calls[0];

			expect(normalizeSql(query)).toBe(
				normalizeSql(`
			INSERT INTO ${conchesTableName}
				(conch_name, confirmations_needed_for_referrals, admin_id)
			VALUES
				('Test Conch', '2', '${mockUserId}')
			RETURNING *
		`),
			);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...mockConch,
				created_at: date,
			});

			expect(mockNextFunction).not.toHaveBeenCalled();
		});

		test("defaults confirmations_needed_for_referrals to 2 when omitted from the request body", async () => {
			mockRequest.body = {
				conch_name: mockConch.conch_name,
			};

			const date = new Date();

			mockPool.query.mockResolvedValue({
				rows: [{ ...mockConch, created_at: date.toISOString() }],
				rowCount: 1,
			});

			await createConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...mockConch,
				confirmations_needed_for_referrals: 2,
				created_at: date,
			});
		});

		test("does not query the database when request validation fails", async () => {
			mockRequest.body = {
				conch_name: 123,
			};

			await createConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockPool.query).not.toHaveBeenCalled();
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards database errors to next", async () => {
			const dbError = new Error("database unavailable");
			mockPool.query.mockRejectedValue(dbError);

			await createConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(dbError);
		});

		test("forwards errors when the returned conch fails schema validation", async () => {
			mockPool.query.mockResolvedValue({
				rows: [
					{
						...mockConch,
						conch_id: "invalid",
					},
				],
				rowCount: 1,
			});

			await createConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});
	});

	describe("getAllPersonalConches", () => {
		test("retrieves all conches belonging to the authenticated user", async () => {
			const personalConches = [
				mockConch,
				{
					...mockConch,
					conch_id: 789,
					conch_name: "Second Conch",
				},
			];

			const date = new Date();

			mockPool.query.mockResolvedValue({
				rows: personalConches.map((conch) => {
					return { ...conch, created_at: date.toISOString() };
				}),
				rowCount: personalConches.length,
			});

			await getAllPersonalConchesHandler(
				mockRequest,
				mockResponse,
				mockNextFunction,
			);

			const [query, values] = mockPool.query.mock.calls[0];
			expect(normalizeSql(query)).toBe(
				normalizeSql(`
		SELECT * FROM ${conchesTableName}
		WHERE ${conchesIdColumnName} = ANY($1)
	`),
			);
			expect(values).toEqual([[1, 2, 3]]);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(
				personalConches.map((conch) => {
					return { ...conch, created_at: date };
				}),
			);
		});

		test("returns an empty array when the user has no personal conches", async () => {
			const noPersonalConchesRequest = {
				body: {},
				user: {
					[usersIdColumnName]: mockUserId,
					serverIds: [],
				},
			} as unknown as Request;

			mockPool.query.mockResolvedValue({
				rows: [],
				rowCount: 0,
			});

			await getAllPersonalConchesHandler(
				noPersonalConchesRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith([]);
		});

		test("forwards database errors to next", async () => {
			const dbError = new Error("query failed");

			mockPool.query.mockRejectedValue(dbError);

			await getAllPersonalConchesHandler(
				mockRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(dbError);
		});

		test("forwards validation errors when returned conches are invalid", async () => {
			mockPool.query.mockResolvedValue({
				rows: [
					{
						...mockConch,
						conch_id: "invalid",
					},
				],
				rowCount: 1,
			});

			await getAllPersonalConchesHandler(
				mockRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});
	});

	describe("getConch", () => {
		test("retrieves the conch using res.locals.conchId", async () => {
			await getConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockGetConchFromDb).toHaveBeenCalledWith(mockPool, mockConchId);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(mockConch);

			expect(mockNextFunction).not.toHaveBeenCalled();
		});

		test("forwards a 404 when the conch cannot be retrieved", async () => {
			mockGetConchFromDb.mockResolvedValue(null);

			await getConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledOnce();
			const error = vi.mocked(mockNextFunction).mock.calls[0][0];
			expect(error).toMatchObject({
				message: "Could not retrieve Conch",
				statusCode: 404,
			});
		});

		test("forwards database retrieval errors", async () => {
			const dbError = new Error("database unavailable");

			mockGetConchFromDb.mockRejectedValue(dbError);

			await getConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(dbError);
		});
	});

	describe("updateConch", () => {
		test("updates a conch when the authenticated user is its admin", async () => {
			const updateBody = conchesUpdateSchema.parse({
				...mockConch,
				conch_name: "Updated Conch",
			});
			const updateBodyRequest = {
				...mockRequest,
				body: updateBody,
			} as unknown as Request;

			const date = new Date();

			const updatedConch = {
				...mockConch,
				conch_name: "Updated Conch",
				created_at: date.toISOString(),
			};

			mockPool.query.mockResolvedValue({
				rows: [updatedConch],
				rowCount: 1,
			});

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockGetConchFromDb).toHaveBeenCalledWith(mockPool, mockConchId);
			expect(mockPool.query).toHaveBeenCalledOnce();

			const [query] = mockPool.query.mock.calls[0];
			expect(normalizeSql(query)).toBe(
				normalizeSql(`
		UPDATE ${conchesTableName}
		SET (conch_name,confirmations_needed_for_referrals) = ('Updated Conch','2')
		WHERE ${conchesIdColumnName} = '${mockConchId}'
		RETURNING *
	`),
			);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...updatedConch,
				created_at: date,
			});
		});

		test("updates an existing conch's confirmations_needed_for_referrals to a new value", async () => {
			const updateBodyRequest = {
				...mockRequest,
				body: {
					confirmations_needed_for_referrals: 5,
				},
			} as unknown as Request;

			const date = new Date();
			const updatedConch = {
				...mockConch,
				confirmations_needed_for_referrals: 5,
				created_at: date.toISOString(),
			};

			mockPool.query.mockResolvedValue({
				rows: [updatedConch],
				rowCount: 1,
			});

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...updatedConch,
				created_at: date,
			});
		});

		test("does not query when no update columns are supplied", async () => {
			const updateBodyRequest = {
				...mockRequest,
				body: {},
			} as unknown as Request;

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockGetConchFromDb).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();

			const error = vi.mocked(mockNextFunction).mock.calls[0][0];

			expect(error).toBeInstanceOf(z.ZodError);
		});

		test("does not update when the conch cannot be found", async () => {
			const updateBody = conchesUpdateSchema.parse({
				...mockConch,
				conch_name: "Updated Conch",
			});
			const updateBodyRequest = {
				...mockRequest,
				body: updateBody,
			} as unknown as Request;

			mockGetConchFromDb.mockResolvedValue(null);

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			const error = vi.mocked(mockNextFunction).mock.calls[0][0];

			expect(error).toMatchObject({
				message: "Could not retrieve Conch",
				statusCode: 404,
			});
		});

		test("does not update when the authenticated user is not the conch admin", async () => {
			const updateBody = conchesUpdateSchema.parse({
				...mockConch,
				conch_name: "Updated Conch",
			});
			const updateBodyRequest = {
				...mockRequest,
				body: updateBody,
			} as unknown as Request;

			mockGetConchFromDb.mockResolvedValue({
				...mockConch,
				admin_id: 999,
			} as unknown as z.infer<typeof conchesSchema>);

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockPool.query).not.toHaveBeenCalled();

			const error = vi.mocked(mockNextFunction).mock.calls[0][0];

			expect(error).toMatchObject({
				message: "Only admins of this conch can update it. ",
				statusCode: 403,
			});
		});

		test("does not query when request body validation fails", async () => {
			const updateBodyRequest = {
				...mockRequest,
				body: {
					...mockConch,
					conch_name: 123,
				},
			} as unknown as Request;

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockGetConchFromDb).not.toHaveBeenCalled();
			expect(mockPool.query).not.toHaveBeenCalled();

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});

		test("forwards database update errors", async () => {
			mockRequest.body = {
				conch_name: "Updated Conch",
			};

			const dbError = new Error("update failed");

			mockPool.query.mockRejectedValue(dbError);

			await updateConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(dbError);
		});

		test("forwards validation errors when the updated conch is invalid", async () => {
			const updateBody = conchesUpdateSchema.parse({
				...mockConch,
				conch_name: "Updated Conch",
			});
			const updateBodyRequest = {
				...mockRequest,
				body: updateBody,
			} as unknown as Request;

			mockPool.query.mockResolvedValue({
				rows: [
					{
						...mockConch,
						conch_id: "invalid",
					},
				],
				rowCount: 1,
			});

			await updateConchHandler(
				updateBodyRequest,
				mockResponse,
				mockNextFunction,
			);

			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});
	});

	describe("deleteConch", () => {
		test("deletes the conch identified by res.locals.conchId", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
				rowCount: 1,
			});

			await deleteConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockPool.query).toHaveBeenCalledWith(
				expect.stringContaining(`DELETE from ${conchesTableName}`),
				[mockConchId],
			);

			expect(mockPool.query).toHaveBeenCalledWith(
				expect.stringContaining(`${conchesIdColumnName} = $1`),
				[mockConchId],
			);

			expect(mockResponse.status).toHaveBeenCalledWith(204);
			expect(mockResponse.json).toHaveBeenCalledOnce();

			expect(mockNextFunction).not.toHaveBeenCalled();
		});

		test("forwards a 404 when no rows are deleted", async () => {
			mockPool.query.mockResolvedValue({
				rows: [],
				rowCount: 0,
			});

			await deleteConchHandler(mockRequest, mockResponse, mockNextFunction);

			const error = vi.mocked(mockNextFunction).mock.calls[0][0];

			expect(error).toMatchObject({
				message: "Could not delete any rows",
				statusCode: 404,
			});

			expect(mockResponse.status).not.toHaveBeenCalled();
		});

		test("forwards database deletion errors", async () => {
			const dbError = new Error("delete failed");

			mockPool.query.mockRejectedValue(dbError);

			await deleteConchHandler(mockRequest, mockResponse, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(dbError);
		});
	});
});
