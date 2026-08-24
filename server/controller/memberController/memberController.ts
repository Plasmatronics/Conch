import { Pool, PoolClient } from "pg";
import {
	membersIdColumnName,
	membersSchema,
	memberQuerySchema,
	membersTableName,
	membersUpdateSchema,
	postMembersTableName,
	postMembersSchema,
	postsIdColumnName,
	postsTableName,
	conchesIdColumnName,
} from "../../schemas";
import { ControllerFactory } from "../controllerFactory";
import { CRUDFactory } from "../../queries";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors";
import z from "zod";
import { idSchema } from "../../schemas/utils";

export const membersControllers = (dbPool: Pool) => {
	const crudFactory = new CRUDFactory({
		tableName: membersTableName,
		idColumnName: membersIdColumnName,
	});

	const memberControllerFactory = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: memberQuerySchema,
		updateSchema: membersUpdateSchema,
		tableSchema: membersSchema,
		conchScoped: true,
		idParamName: "memberId",
	});

	return memberControllerFactory.createControllers();
};

export const deletePostMembers =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		let poolClient: PoolClient | null = null;

		try {
			poolClient = await dbPool.connect();
			await poolClient.query("BEGIN");
			const { memberIds } = req.body;
			const parsedMemberIds = z.number().array().parse(memberIds);
			const parsedPostId = idSchema.parse(req.params.postId);
			const parsedConchId = idSchema.parse(req.params.conchId);

			for (const id of parsedMemberIds) {
				const postMembersDeleteRes = await poolClient.query(
					`
					DELETE FROM ${postMembersTableName} WHERE ${membersIdColumnName} = $1
					AND ${postsIdColumnName} = $2
					AND ${postsIdColumnName} IN (SELECT ${postsIdColumnName} FROM ${postsTableName} WHERE ${conchesIdColumnName} = $3)
					`,
					[id, parsedPostId, parsedConchId],
				);
				if (!postMembersDeleteRes.rowCount) {
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
						"Bulk PostMember deletion failed and rollback also failed",
					),
				);
			}
		} finally {
			if (poolClient) poolClient.release();
		}
	};

export const addPostMembers =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		let poolClient: PoolClient | null = null;

		try {
			poolClient = await dbPool.connect();
			await poolClient.query("BEGIN");
			const { memberIds } = req.body;
			const parsedMembersArr = z.number().array().parse(memberIds);
			const parsedPostId = idSchema.parse(req.params.postId);
			const parsedConchId = idSchema.parse(req.params.conchId);

			const postMemberArr: z.infer<typeof postMembersSchema>[] = [];
			for (const memberId of parsedMembersArr) {
				const postMemberCreationRes = await poolClient.query(
					`
					INSERT INTO ${postMembersTableName}
						(${membersIdColumnName}, ${postsIdColumnName})
					SELECT m.${membersIdColumnName}, p.${postsIdColumnName}
					FROM ${membersTableName} AS m
					JOIN ${postsTableName} AS p
						ON p.${postsIdColumnName} = $2
					WHERE m.${membersIdColumnName} = $1
					AND m.${conchesIdColumnName} = $3
					AND p.${conchesIdColumnName} = $3
					RETURNING *;
				`,
					[memberId, parsedPostId, parsedConchId],
				);
				if (!postMemberCreationRes.rowCount) {
					throw new AppError("Member or post not found in this conch", 404);
				}

				const parsedPostMemberCreationRes = postMembersSchema.parse(
					postMemberCreationRes.rows[0],
				);

				postMemberArr.push(parsedPostMemberCreationRes);
			}

			await poolClient.query("COMMIT");
			return res.status(201).json(postMemberArr);
		} catch (originalErr: unknown) {
			try {
				if (poolClient) await poolClient.query("ROLLBACK");
				return next(originalErr);
			} catch (rollbackErr: unknown) {
				return next(
					new AggregateError(
						[originalErr, rollbackErr],
						"Bulk PostMember creation failed and rollback also failed",
					),
				);
			}
		} finally {
			if (poolClient) poolClient.release();
		}
	};
