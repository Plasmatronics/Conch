import { NextFunction, Request, Response } from "express";
import { Pool } from "pg";
import {
	conchesCreateSchema,
	conchesIdColumnName,
	conchesSchema,
	conchesTableName,
	conchesUpdateSchema,
	usersIdColumnName,
} from "../schemas";
import format from "pg-format";
import z from "zod";
import { getConch as getConchFromDb } from "../queries";

export const createConch =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const entries = Object.entries(conchesCreateSchema.parse(req.body));
			entries.push(["admin_id", req.user![usersIdColumnName]]);

			const columnPlaceholders = entries.map(() => `%I`).join(", ");
			const columns = entries.map(([key]) => key);

			const valuePlaceholders = entries.map(() => `%L`).join(", ");
			const values = entries.map(([_key, value]) => value);

			const conchCreationQuery = format(
				`INSERT INTO ${conchesTableName} (${columnPlaceholders}) VALUES (${valuePlaceholders}) RETURNING *`,
				...columns,
				...values,
			);

			const conchCreationRes = await dbPool.query(conchCreationQuery);
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
			const getPersonalConchesRes = await dbPool.query(
				`SELECT * FROM ${conchesTableName}
  				 WHERE ${conchesIdColumnName} = ANY($1)`,
				[personalConchesIds],
			);

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
			if (!conch)
				return res.status(404).json({ message: "Could not retrieve Conch" });
			return res.status(200).json(conch);
		} catch (err) {
			return next(err);
		}
	};

export const updateConch =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const entries = Object.entries(conchesUpdateSchema.parse(req.body));
			if (!entries.length)
				return res
					.status(400)
					.json({ message: "No columns entered for update" });

			const conch = await getConchFromDb(dbPool, res.locals.conchId);
			if (!conch)
				return res.status(404).json({ message: "Could not retrieve Conch" });
			if (conch.admin_id !== req.user![usersIdColumnName])
				return res
					.status(403)
					.json({ message: "Only admins of this conch can update it." });

			const columns = entries.map(([key]) => key);
			const columnsPlaceholder = columns.map(() => "%I").join(",");
			const values = entries.map(([_key, value]) => value);
			const valuesPlaceholder = values.map(() => "%L").join(",");

			const updateConchQuery = format(
				`UPDATE ${conchesTableName} 
				SET (${columnsPlaceholder}) = (${valuesPlaceholder}) 
				WHERE ${conchesIdColumnName} = %L
				RETURNING *`,
				...columns,
				...values,
				res.locals.conchId,
			);
			const updateConchRes = await dbPool.query(updateConchQuery);

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
			const deleteConchRes = await dbPool.query(
				`DELETE from ${conchesTableName} WHERE
				${conchesIdColumnName} = $1`,
				[res.locals.conchId],
			);
			const deletedRows = deleteConchRes.rowCount;
			if (!deletedRows)
				return res.status(404).json({ message: "Could not delete any rows" });

			return res.status(204).json();
		} catch (err) {
			return next(err);
		}
	};
