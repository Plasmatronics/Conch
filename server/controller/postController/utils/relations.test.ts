import { beforeEach, describe, expect, test, vi } from "vitest";
import type { PoolClient } from "pg";
import {
	mediaIdColumnName,
	mediaTableName,
	membersIdColumnName,
	postMembersTableName,
	postMediaTableName,
	postsIdColumnName,
} from "../../../schemas";
import { mockPoolClient, normalizeSql } from "../../../vitest.setup";
import { createPostMembers } from "./members";
import { createMedia, createPostMedia } from "./media";

const poolClient = mockPoolClient as unknown as PoolClient;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("post relationship query helpers", () => {
	test("creates post-member records with one batched insert", async () => {
		mockPoolClient.query.mockResolvedValue({ rowCount: 1, rows: [] });

		await createPostMembers(poolClient, [11, 12], 44);

		expect(mockPoolClient.query).toHaveBeenCalledOnce();
		expect(mockPoolClient.query).toHaveBeenCalledWith(
			expect.stringContaining(`INSERT INTO ${postMembersTableName}`),
			[11, 44, 12, 44],
		);
		expect(normalizeSql(mockPoolClient.query.mock.calls[0][0])).toContain(
			`(${membersIdColumnName}, ${postsIdColumnName}) VALUES ($1, $2), ($3, $4)`,
		);
	});

	test("creates post-media records with one batched insert", async () => {
		mockPoolClient.query.mockResolvedValue({ rowCount: 1, rows: [] });

		await createPostMedia(poolClient, [21, 22], 44);

		expect(mockPoolClient.query).toHaveBeenCalledWith(
			expect.stringContaining(`INSERT INTO ${postMediaTableName}`),
			[21, 44, 22, 44],
		);
		expect(mockPoolClient.query).toHaveBeenCalledOnce();
	});

	test("creates media with one batched insert and returns IDs in input order", async () => {
		mockPoolClient.query.mockResolvedValue({
			rowCount: 2,
			rows: [{ media_id: 31 }, { media_id: 32 }],
		});

		const mediaIds = await createMedia(
			poolClient,
			[
				{
					storage_key: "one.jpg",
					mime_type: "image/jpeg",
					media_type: "image",
				},
				{
					storage_key: "two.mp3",
					mime_type: "audio/mpeg",
					media_type: "audio",
				},
			],
			55,
		);

		expect(mediaIds).toEqual([31, 32]);
		expect(mockPoolClient.query).toHaveBeenCalledOnce();
		expect(normalizeSql(mockPoolClient.query.mock.calls[0][0])).toBe(
			`INSERT INTO ${mediaTableName} (storage_key, mime_type, media_type, conch_id) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8) RETURNING ${mediaIdColumnName}`,
		);
		expect(mockPoolClient.query.mock.calls[0][1]).toEqual([
			"one.jpg",
			"image/jpeg",
			"image",
			55,
			"two.mp3",
			"audio/mpeg",
			"audio",
			55,
		]);
	});

	test("reports media creation failures", async () => {
		mockPoolClient.query.mockResolvedValue({ rowCount: 0, rows: [] });

		await expect(
			createMedia(
				poolClient,
				[
					{
						storage_key: "missing.jpg",
						mime_type: "image/jpeg",
						media_type: "image",
					},
				],
				55,
			),
		).rejects.toMatchObject({
			message: "Failed to create media",
			statusCode: 500,
		});
	});

	test("reports partial batch media creation failures", async () => {
		mockPoolClient.query.mockResolvedValue({
			rowCount: 1,
			rows: [{ media_id: 31 }],
		});

		await expect(
			createMedia(
				poolClient,
				[
					{
						storage_key: "first.jpg",
						mime_type: "image/jpeg",
						media_type: "image",
					},
					{
						storage_key: "second.jpg",
						mime_type: "image/jpeg",
						media_type: "image",
					},
				],
				55,
			),
		).rejects.toMatchObject({
			message: "Failed to create media",
			statusCode: 500,
		});
	});

	test("does not execute an insert for empty relationship inputs", async () => {
		await createPostMembers(poolClient, [], 44);
		await createPostMedia(poolClient, [], 44);
		await createMedia(poolClient, [], 55);

		expect(mockPoolClient.query).not.toHaveBeenCalled();
	});
});
