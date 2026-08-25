import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Request, Response } from "express";
import type { Pool } from "pg";
import z from "zod";
import {
	createPost,
	deletePost,
	getAllPosts,
	getMemberPosts,
	getPost,
	patchPost,
} from "./postController";
import {
	mediaTableName,
	postMembersTableName,
	postMediaTableName,
	postsIdColumnName,
	postsTableName,
	usersIdColumnName,
} from "../../schemas";
import { AppError } from "../../errors";
import {
	mockNextFunction,
	mockPool,
	mockPoolClient,
	mockResponse,
	normalizeSql,
} from "../../vitest.setup";

const conchId = 42;
const postId = 84;
const memberId = 21;
const authorId = 7;
const createdAt = new Date("2026-01-02T03:04:05.000Z");

const post = {
	[postsIdColumnName]: postId,
	author_id: authorId,
	title: "A test post",
	created_at: createdAt.toISOString(),
	body_text: "A body",
	location: { type: "Point" as const, coordinates: [1, 2] as [number, number] },
	date: { season: "summer" as const, year: 2026 },
	conch_id: conchId,
};

const hydratedPost = {
	...post,
	members: [
		{
			first_name: "Test",
			last_name: "Member",
			conch_id: conchId,
			photo: null,
		},
	],
	media: [
		{
			storage_key: "posts/image.jpg",
			mime_type: "image/jpeg",
			media_type: "image" as const,
			is_conch_cover_photo: false,
		},
	],
};

const request = (overrides: Partial<Request> = {}) =>
	({
		params: {
			conchId: String(conchId),
			postId: String(postId),
			memberId: String(memberId),
		},
		body: {},
		user: { [usersIdColumnName]: authorId },
		...overrides,
	}) as unknown as Request;

const postHandler = getPost(mockPool as unknown as Pool);
const updateHandler = patchPost(mockPool as unknown as Pool);
const deleteHandler = deletePost(mockPool as unknown as Pool);
const createHandler = createPost(mockPool as unknown as Pool);
const allHandler = getAllPosts(mockPool as unknown as Pool);
const memberHandler = getMemberPosts(mockPool as unknown as Pool);
const deleteResponse = {
	...mockResponse,
	end: vi.fn().mockReturnThis(),
} as unknown as Response;

beforeEach(() => {
	vi.clearAllMocks();
	mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
	mockPool.connect.mockResolvedValue(mockPoolClient);
	mockPoolClient.query.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe("postController", () => {
	describe("getPost", () => {
		test("retrieves and hydrates a post by conch and post id", async () => {
			mockPool.query.mockResolvedValue({ rows: [hydratedPost], rowCount: 1 });

			await postHandler(request(), mockResponse, mockNextFunction);

			expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
				postId,
				conchId,
			]);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...hydratedPost,
				created_at: createdAt,
			});
		});

		test("forwards validation and not-found errors", async () => {
			await postHandler(
				request({ params: { conchId: "bad", postId: String(postId) } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));

			vi.clearAllMocks();
			mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
			await postHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Could not find post", 404),
			);
		});

		test("forwards database and response schema errors", async () => {
			const error = new Error("query failed");
			mockPool.query.mockRejectedValue(error);
			await postHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(error);

			vi.clearAllMocks();
			mockPool.query.mockResolvedValue({
				rows: [{ ...hydratedPost, title: 123 }],
				rowCount: 1,
			});
			await postHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});
	});

	describe("getAllPosts and getMemberPosts", () => {
		test("retrieves all posts for a conch", async () => {
			mockPool.query.mockResolvedValue({ rows: [hydratedPost], rowCount: 1 });
			await allHandler(request(), mockResponse, mockNextFunction);
			expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
				conchId,
			]);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith([
				{ ...hydratedPost, created_at: createdAt },
			]);
		});

		test("retrieves posts filtered by member", async () => {
			mockPool.query.mockResolvedValue({ rows: [hydratedPost], rowCount: 1 });
			await memberHandler(request(), mockResponse, mockNextFunction);
			expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
				conchId,
				memberId,
			]);
		});

		test("returns an empty list and forwards invalid parameters or rows", async () => {
			await allHandler(request(), mockResponse, mockNextFunction);
			expect(mockResponse.json).toHaveBeenCalledWith([]);

			vi.clearAllMocks();
			await memberHandler(
				request({ params: { conchId: "bad", memberId: String(memberId) } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));
		});
	});

	describe("updatePost", () => {
		test("updates supplied fields and returns the hydrated post", async () => {
			const body = { title: "Updated title", body_text: null };
			mockPool.query
				.mockResolvedValueOnce({ rowCount: 1, rows: [] })
				.mockResolvedValueOnce({ rows: [hydratedPost], rowCount: 1 });

			await updateHandler(request({ body }), mockResponse, mockNextFunction);

			const [query, values] = mockPool.query.mock.calls[0];
			expect(normalizeSql(query)).toContain(
				`UPDATE ${postsTableName} SET title = $1, body_text = $2`,
			);
			expect(normalizeSql(query)).toContain(
				`WHERE ${postsIdColumnName} = $3 AND conch_id = $4`,
			);
			expect(values).toEqual([body.title, body.body_text, postId, conchId]);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...hydratedPost,
				created_at: createdAt,
			});
		});

		test("rejects empty or invalid updates and missing posts", async () => {
			await updateHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));

			vi.clearAllMocks();
			await updateHandler(
				request({ body: { title: 123 } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));

			vi.clearAllMocks();
			mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });
			await updateHandler(
				request({ body: { title: "Updated" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Could not find this post to update", 404),
			);
		});

		test("forwards retrieval and database errors", async () => {
			mockPool.query
				.mockResolvedValueOnce({ rowCount: 1, rows: [] })
				.mockResolvedValueOnce({ rows: [], rowCount: 0 });
			await updateHandler(
				request({ body: { title: "Updated" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Unable to retrieve post after update", 500),
			);

			vi.clearAllMocks();
			const error = new Error("update failed");
			mockPool.query.mockRejectedValue(error);
			await updateHandler(
				request({ body: { title: "Updated" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});

	describe("deletePost", () => {
		test("deletes a post scoped to its conch", async () => {
			mockPool.query.mockResolvedValue({ rowCount: 1, rows: [] });
			await deleteHandler(request(), deleteResponse, mockNextFunction);
			expect(normalizeSql(mockPool.query.mock.calls[0][0])).toContain(
				`DELETE FROM ${postsTableName}`,
			);
			expect(mockPool.query).toHaveBeenCalledWith(expect.any(String), [
				conchId,
				postId,
			]);
			expect(deleteResponse.status).toHaveBeenCalledWith(204);
			expect(deleteResponse.end).toHaveBeenCalled();
		});

		test("forwards invalid parameters, missing posts, and database errors", async () => {
			await deleteHandler(
				request({ params: { conchId: "bad", postId: String(postId) } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));

			vi.clearAllMocks();
			await deleteHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Could not find this post to delete", 404),
			);

			vi.clearAllMocks();
			const error = new Error("delete failed");
			mockPool.query.mockRejectedValue(error);
			await deleteHandler(request(), mockResponse, mockNextFunction);
			expect(mockNextFunction).toHaveBeenCalledWith(error);
		});
	});

	describe("createPost", () => {
		const body = {
			title: "New post",
			body_text: "New body",
			location: {
				type: "Point" as const,
				coordinates: [3, 4] as [number, number],
			},
			date: { season: "spring" as const, year: 2025 },
			members: [memberId],
			media: [
				{
					storage_key: "new.jpg",
					mime_type: "image/jpeg",
					media_type: "image" as const,
				},
			],
		};

		test("creates related records in a transaction and returns the hydrated post", async () => {
			mockPoolClient.query
				.mockResolvedValueOnce({ rows: [], rowCount: 0 })
				.mockResolvedValueOnce({ rows: [post], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [{ media_id: 101 }], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [hydratedPost], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [], rowCount: 0 });

			await createHandler(request({ body }), mockResponse, mockNextFunction);

			expect(
				mockPoolClient.query.mock.calls.map(([query]) => normalizeSql(query)),
			).toEqual([
				"BEGIN",
				expect.stringContaining(`INSERT INTO ${postsTableName}`),
				expect.stringContaining(`INSERT INTO ${mediaTableName}`),
				expect.stringContaining(`INSERT INTO ${postMediaTableName}`),
				expect.stringContaining(`INSERT INTO ${postMembersTableName}`),
				expect.stringContaining("SELECT"),
				"COMMIT",
			]);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith({
				...hydratedPost,
				created_at: createdAt,
			});
			expect(mockPoolClient.release).toHaveBeenCalledOnce();
		});

		test("applies defaults and skips empty related-record inserts", async () => {
			mockPoolClient.query
				.mockResolvedValueOnce({ rows: [], rowCount: 0 })
				.mockResolvedValueOnce({ rows: [post], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [hydratedPost], rowCount: 1 })
				.mockResolvedValueOnce({ rows: [], rowCount: 0 });
			await createHandler(
				request({ body: { title: "Minimal" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockPoolClient.query).toHaveBeenCalledTimes(4);
			expect(mockPoolClient.query.mock.calls[1][1]).toEqual([
				"Minimal",
				null,
				null,
				null,
				authorId,
				conchId,
			]);
		});

		test("rolls back and forwards validation or creation errors", async () => {
			await createHandler(
				request({ body: { title: 123 } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockPoolClient.query).toHaveBeenCalledWith("ROLLBACK");
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(z.ZodError));

			vi.clearAllMocks();
			mockPoolClient.query
				.mockResolvedValueOnce({ rows: [], rowCount: 0 })
				.mockResolvedValueOnce({ rows: [], rowCount: 0 });
			await createHandler(
				request({ body: { title: "New" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(
				new AppError("Failed to create post", 500),
			);
			expect(mockPoolClient.query).toHaveBeenLastCalledWith("ROLLBACK");

			vi.clearAllMocks();
			const error = new Error("rollback failed");
			mockPoolClient.query
				.mockRejectedValueOnce(new Error("insert failed"))
				.mockRejectedValueOnce(error);
			await createHandler(
				request({ body: { title: "New" } }),
				mockResponse,
				mockNextFunction,
			);
			expect(mockNextFunction).toHaveBeenCalledWith(expect.any(AggregateError));
		});
	});
});
