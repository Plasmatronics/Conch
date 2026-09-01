import { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import {
	conchesCreateSchema,
	conchesIdColumnName,
	conchesSchema,
	conchesTableName,
	conchesUpdateSchema,
	usersIdColumnName,
} from "../../schemas";
import z from "zod";
import {
	CreateQueryBuilder,
	DeleteQueryBuilder,
	getConchFromDb,
	ReadQueryBuilder,
	UpdateQueryBuilder,
} from "../../queries";
import { AppError } from "../../errors";

export const createConch =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const entries = Object.entries(conchesCreateSchema.parse(req.body));
			entries.push(["admin_id", req.user![usersIdColumnName]]);

			const { query, values } = new CreateQueryBuilder(conchesTableName)
				.addCreateFields(
					entries.map(([key, value]) => {
						return {
							key,
							value,
						};
					}),
				)
				.addReturning(["*"])
				.build();

			const conchCreationRes = await dbPool.query(query, values);
			const createdConch = conchesSchema.parse(conchCreationRes.rows[0]);
			return res.status(201).json(createdConch);
		} catch (err) {
			return next(err);
		}
	};

export const getAllPersonalConches =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const personalConchesIds = req.user!.serverIds;
			const { query, values } = new ReadQueryBuilder(conchesTableName)
				.addAnyConditions([
					{
						key: conchesIdColumnName,
						values: personalConchesIds,
					},
				])
				.build();
			const getPersonalConchesRes = await dbPool.query(query, values);

			const personalConches = z
				.array(conchesSchema)
				.parse(getPersonalConchesRes.rows);

			return res.status(200).json(personalConches);
		} catch (err) {
			return next(err);
		}
	};

export const getConch =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const conch = await getConchFromDb(dbPool, res.locals.conchId);
			if (!conch) throw new AppError("Could not retrieve Conch", 404);

			return res.status(200).json(conch);
		} catch (err) {
			return next(err);
		}
	};

export const updateConch =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const entries = Object.entries(conchesUpdateSchema.parse(req.body));

			const conch = await getConchFromDb(dbPool, res.locals.conchId);
			if (!conch) throw new AppError("Could not retrieve Conch", 404);
			if (conch.admin_id !== req.user![usersIdColumnName])
				throw new AppError("Only admins of this conch can update it. ", 403);

			const { query, values } = new UpdateQueryBuilder(conchesTableName)
				.addUpdateFields(entries.map(([key, value]) => ({ key, value })))
				.addConditions([
					{
						key: conchesIdColumnName,
						operator: "=",
						value: res.locals.conchId,
					},
				])
				.addReturning(["*"])
				.build();
			const updateConchRes = await dbPool.query(query, values);

			const updatedConch = conchesSchema.parse(updateConchRes.rows[0]);
			return res.status(200).json(updatedConch);
		} catch (err) {
			return next(err);
		}
	};

export const deleteConch =
	(dbPool: Pool) =>
	async (_req: Request, res: Response, next: NextFunction) => {
		try {
			const { query, values } = new DeleteQueryBuilder(conchesTableName)
				.addConditions([
					{
						key: conchesIdColumnName,
						operator: "=",
						value: res.locals.conchId,
					},
				])
				.build();
			const deleteConchRes = await dbPool.query(query, values);
			const deletedRows = deleteConchRes.rowCount;
			if (!deletedRows) throw new AppError("Could not delete any rows", 404);

			return res.status(204).json();
		} catch (err) {
			return next(err);
		}
	};
