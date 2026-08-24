import { NextFunction, Request, Response } from "express";
import { Pool, PoolClient } from "pg";
import { AppError } from "../../errors";
import {
	postQuerySchema,
	postsCreateSchema,
	postsIdColumnName,
	postsSchema,
	postsTableName,
	postsUpdateSchema,
	usersIdColumnName,
} from "../../schemas";
import z from "zod";
import {
	createMedia,
	createPostMedia,
	createPostMembers,
	getHydratedPostQuery,
	getHydratedPostsQuery,
	getMemberHydratedPostsQuery,
} from "./utils";
import { idSchema } from "../../schemas/utils";
import format from "pg-format";

export const getPost =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { conchId, postId } = req.params;
			const parsedConchId = idSchema.parse(conchId);
			const parsedPostId = idSchema.parse(postId);

			const result = await dbPool.query(getHydratedPostQuery, [
				parsedPostId,
				parsedConchId,
			]);
			if (!result.rowCount) throw new AppError("Could not find post", 404);

			const hydratedPost = postQuerySchema.parse(result.rows[0]);
			return res.status(200).json(hydratedPost);
		} catch (err) {
			return next(err);
		}
	};

export const patchPost =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { postId, conchId } = req.params;
			const parsedPostId = idSchema.parse(postId);
			const parsedConchId = idSchema.parse(conchId);
			const parsedBody = postsUpdateSchema.parse(req.body);

			const updateKeys = Object.keys(parsedBody);
			const updateValues = Object.values(parsedBody);

			const updatePlaceholders = updateKeys
				.map((_, idx) => `%I = $${idx + 1}`)
				.join(", ");

			const formattedUpdatePostQuery = format(
				`
    UPDATE %I
    SET ${updatePlaceholders}
    WHERE %I = $${updateValues.length + 1}
    AND conch_id = $${updateValues.length + 2}
    `,
				postsTableName,
				...updateKeys,
				postsIdColumnName,
			);

			const updatePostRes = await dbPool.query(formattedUpdatePostQuery, [
				...updateValues,
				parsedPostId,
				parsedConchId,
			]);

			if (!updatePostRes.rowCount)
				throw new AppError("Could not find this post to update", 404);

			const getUpdatedPostRes = await dbPool.query(getHydratedPostQuery, [
				parsedPostId,
				parsedConchId,
			]);

			if (!getUpdatedPostRes.rowCount)
				throw new AppError("Unable to retrieve post after update", 500);

			const parsedUpdatedPost = postQuerySchema.parse(
				getUpdatedPostRes.rows[0],
			);
			return res.status(200).json(parsedUpdatedPost);
		} catch (err) {
			return next(err);
		}
	};

export const deletePost =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { conchId, postId } = req.params;
			const parsedConchId = idSchema.parse(conchId);
			const parsedPostId = idSchema.parse(postId);

			const deletePostRes = await dbPool.query(
				`
				DELETE FROM ${postsTableName}
				WHERE conch_id = $1
				AND ${postsIdColumnName} = $2`,
				[parsedConchId, parsedPostId],
			);

			if (!deletePostRes.rowCount)
				throw new AppError("Could not find this post to delete", 404);

			return res.status(204).end();
		} catch (err) {
			return next(err);
		}
	};

export const createPost =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		let poolClient: PoolClient | null = null;

		try {
			poolClient = await dbPool.connect();

			const { conchId } = req.params;
			const parsedConchId = idSchema.parse(conchId);

			const { title, body_text, location, date, members, media } =
				postsCreateSchema.parse(req.body);

			const postCreationObj: Omit<
				z.infer<typeof postsSchema>,
				"created_at" | typeof postsIdColumnName
			> = {
				title,
				body_text: body_text ?? null,
				location: location ?? null,
				date: date ?? null,
				author_id: req.user![usersIdColumnName],
				conch_id: parsedConchId,
			};

			await poolClient.query("BEGIN");

			const postCreationRes = await poolClient.query(
				`
                INSERT INTO ${postsTableName} (
                    title,
                    body_text,
                    location,
                    date,
                    author_id,
                    conch_id
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                RETURNING *;
                `,
				[
					postCreationObj.title,
					postCreationObj.body_text,
					postCreationObj.location,
					postCreationObj.date,
					postCreationObj.author_id,
					postCreationObj.conch_id,
				],
			);
			if (!postCreationRes.rowCount) {
				throw new AppError("Failed to create post", 500);
			}

			const parsedCreatedPost = postsSchema.parse(postCreationRes.rows[0]);
			const createdPostId = parsedCreatedPost[postsIdColumnName];

			const mediaIds = await createMedia(poolClient, media, parsedConchId);
			await createPostMedia(poolClient, mediaIds, createdPostId);
			await createPostMembers(poolClient, members, createdPostId);

			const hydratedPostRes = await poolClient.query(getHydratedPostQuery, [
				createdPostId,
				parsedConchId,
			]);
			if (!hydratedPostRes.rowCount) {
				throw new AppError("Failed to retrieve created post", 500);
			}

			const hydratedPost = postQuerySchema.parse(hydratedPostRes.rows[0]);
			await poolClient.query("COMMIT");
			return res.status(201).json(hydratedPost);
		} catch (originalErr: unknown) {
			try {
				if (poolClient) await poolClient.query("ROLLBACK");
				return next(originalErr);
			} catch (rollbackErr: unknown) {
				return next(
					new AggregateError(
						[originalErr, rollbackErr],
						"Post creation failed and rollback also failed",
					),
				);
			}
		} finally {
			if (poolClient) poolClient.release();
		}
	};

export const getAllPosts =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { conchId } = req.params;
			const parsedConchId = idSchema.parse(conchId);

			const allPostsRes = await dbPool.query(getHydratedPostsQuery, [
				parsedConchId,
			]);

			const parsedPosts = z.array(postQuerySchema).parse(allPostsRes.rows);

			return res.status(200).json(parsedPosts);
		} catch (err) {
			return next(err);
		}
	};

export const getMemberPosts =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { conchId, memberId } = req.params;
			const parsedConchId = idSchema.parse(conchId);
			const parsedMemberId = idSchema.parse(memberId);

			const allPostsRes = await dbPool.query(getMemberHydratedPostsQuery, [
				parsedConchId,
				parsedMemberId,
			]);

			const parsedPosts = z.array(postQuerySchema).parse(allPostsRes.rows);

			return res.status(200).json(parsedPosts);
		} catch (err) {
			return next(err);
		}
	};
