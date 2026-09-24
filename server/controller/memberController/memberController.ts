import { Pool, PoolClient } from "pg";
import {
	membersIdColumnName,
	membersSchema,
	membersTableName,
	membersUpdateSchema,
	postMembersTableName,
	postMembersSchema,
	postsIdColumnName,
	postsTableName,
	conchesIdColumnName,
	idSchema,
	membersCreateSchema,
} from "../../schemas";
import { ControllerFactory } from "../controllerFactory";
import {
	CreateQueryBuilder,
	CRUDFactory,
	DeleteQueryBuilder,
} from "../../queries";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors";
import z from "zod";

const addMember =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const conchId = req.params.conchId;
			const parsedConchId = idSchema.parse(conchId);

			const creationObj = membersCreateSchema.parse(req.body);
			const { query, values } = new CreateQueryBuilder(
				membersTableName,
				parsedConchId,
			)
				.addCreateFields(
					Object.entries(creationObj).map(([key, value]) => {
						return {
							key,
							value,
						};
					}),
				)
				.addReturning(["*"])
				.build();

			const queryResponse = await dbPool.query(query, values);
			const row = membersSchema.parse(queryResponse.rows[0]);

			return res.status(201).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

const deleteMember =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const memberId = idSchema.parse(req.params[membersIdColumnName]);
			const parsedConchId = idSchema.parse(req.params.conchId);

			const { query, values } = new DeleteQueryBuilder(
				membersTableName,
				parsedConchId,
			)
				.addConditions([
					{
						key: membersIdColumnName,
						value: memberId,
						operator: "=",
					},
				])
				.addReturning(["*"])
				.build();

			const queryResponse = await dbPool.query(query, values);
			if (!queryResponse.rowCount)
				throw new AppError(`Resource with ID ${memberId} not found.`, 404);
			const row = membersSchema.parse(queryResponse.rows[0]);

			return res.status(200).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

export const membersControllers = (dbPool: Pool) => {
	const crudFactory = new CRUDFactory({
		tableName: membersTableName,
		idColumnName: membersIdColumnName,
	});

	const memberControllerFactory = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: membersCreateSchema,
		updateSchema: membersUpdateSchema,
		tableSchema: membersSchema,
		conchScoped: true,
		idParamName: "memberId",
	});

	const {
		getAll: getAllController,
		get: getController,
		patch: patchController,
		post: _postController,
		delete: _deleteController,
	} = memberControllerFactory.createControllers();

	return {
		getAll: getAllController,
		get: getController,
		patch: patchController,
		post: addMember(dbPool),
		delete: deleteMember(dbPool),
	};
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
