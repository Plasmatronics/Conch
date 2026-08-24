import { Pool, PoolClient } from "pg";
import {
	mediaIdColumnName,
	mediaSchema,
	mediaQuerySchema,
	mediaTableName,
	mediaUpdateSchema,
	postMediaTableName,
	postMediaSchema,
	postsIdColumnName,
	postsTableName,
} from "../../schemas";
import { ControllerFactory } from "../controllerFactory";
import { CRUDFactory } from "../../queries";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors";
import z from "zod";
import { createMedia } from "../postController/utils";
import { idSchema } from "../../schemas/utils";

export const mediaControllers = (dbPool: Pool) => {
	const crudFactory = new CRUDFactory({
		tableName: mediaTableName,
		idColumnName: mediaIdColumnName,
	});

	const mediaControllerFactory = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: mediaQuerySchema,
		updateSchema: mediaUpdateSchema,
		tableSchema: mediaSchema,
		conchScoped: true,
		idParamName: "mediaId",
	});

	return mediaControllerFactory.createControllers();
};

export const deletePostMedia =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		let poolClient: PoolClient | null = null;

		try {
			poolClient = await dbPool.connect();
			await poolClient.query("BEGIN");
			const { mediaIds } = req.body;
			const parsedMediaIds = z.number().array().parse(mediaIds);

			for (const id of parsedMediaIds) {
				const postMediaDeleteRes = await poolClient.query(
					`
					DELETE FROM ${postMediaTableName} WHERE ${mediaIdColumnName} = $1
					`,
					[id],
				);
				if (!postMediaDeleteRes.rowCount) {
					throw new AppError("Could not find resource to delete", 404);
				}

				const mediaDeleteRes = await poolClient.query(
					`
					DELETE FROM ${mediaTableName} WHERE ${mediaIdColumnName} = $1
					`,
					[id],
				);
				if (!mediaDeleteRes.rowCount) {
					throw new AppError("Could not find resource to delete", 404);
				}
			}

			await poolClient.query("COMMIT");
			return res.sendStatus(204);
		} catch (originalErr: unknown) {
			try {
				if (poolClient) await poolClient.query("ROLLBACK");
				return next(originalErr);
			} catch (rollbackErr: unknown) {
				return next(
					new AggregateError(
						[originalErr, rollbackErr],
						"Bulk PostMedia deletion failed and rollback also failed",
					),
				);
			}
		} finally {
			if (poolClient) poolClient.release();
		}
	};

export const addPostMedia =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		let poolClient: PoolClient | null = null;

		try {
			poolClient = await dbPool.connect();
			await poolClient.query("BEGIN");
			const { media } = req.body;
			const parsedMediaArr = mediaQuerySchema.array().parse(media);
			const parsedConchId = idSchema.parse(req.params.conchId);
			const parsedPostId = idSchema.parse(req.params.postId);

			const createdMediaIds = await createMedia(
				poolClient,
				parsedMediaArr,
				parsedConchId,
			);

			const postMediaArr: z.infer<typeof postMediaSchema>[] = [];
			for (const mediaId of createdMediaIds) {
				const postMediaCreationRes = await poolClient.query(
					`
						INSERT INTO ${postMediaTableName}
							(${mediaIdColumnName}, ${postsIdColumnName})
						SELECT $1, p.${postsIdColumnName}
						FROM ${postsTableName} AS p
						WHERE p.${postsIdColumnName} = $2
						AND p.conch_id = $3
						RETURNING *;
    				`,
					[mediaId, parsedPostId, parsedConchId],
				);
				if (!postMediaCreationRes.rowCount) {
					throw new AppError("Post not found in this conch", 404);
				}

				const parsedPostMediaCreationRes = postMediaSchema.parse(
					postMediaCreationRes.rows[0],
				);

				postMediaArr.push(parsedPostMediaCreationRes);
			}

			await poolClient.query("COMMIT");
			return res.status(201).json(postMediaArr);
		} catch (originalErr: unknown) {
			try {
				if (poolClient) await poolClient.query("ROLLBACK");
				return next(originalErr);
			} catch (rollbackErr: unknown) {
				return next(
					new AggregateError(
						[originalErr, rollbackErr],
						"Bulk PostMedia creation failed and rollback also failed",
					),
				);
			}
		} finally {
			if (poolClient) poolClient.release();
		}
	};
