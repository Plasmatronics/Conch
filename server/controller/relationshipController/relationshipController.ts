import { NextFunction, Response, Request } from "express";
import { Pool } from "pg";
import {
	conchesIdColumnName,
	idSchema,
	membersIdColumnName,
	membersTableName,
	relationshipsCreateSchema,
	relationshipsIdColumnName,
	relationshipsSchema,
	relationshipsTableName,
	relationshipsUpdateSchema,
} from "../../schemas";
import { AppError } from "../../errors";
import z from "zod";
import { BuildQuery } from "../../queries/QueryBuilders/QueryBuilder";

export const getAllRelationships =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsedConchId = idSchema.parse(req.params.conchId);

			const query = `
			SELECT r.*
			FROM ${relationshipsTableName} AS r
			JOIN ${membersTableName} AS sm
				ON sm.${membersIdColumnName} = r.source_member_id
			JOIN ${membersTableName} AS tm
				ON tm.${membersIdColumnName} = r.target_member_id
			WHERE sm.${conchesIdColumnName} = $1
				AND tm.${conchesIdColumnName} = $1;
			`;
			const values = [parsedConchId];

			const queryResponse = await dbPool.query(query, values);
			const row = z.array(relationshipsSchema).parse(queryResponse.rows);

			return res.status(200).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

export const getRelationship =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const relationshipId = idSchema.parse(req.params.relationshipId);
			const parsedConchId = idSchema.parse(req.params.conchId);

			const query = `
			SELECT r.* FROM ${relationshipsTableName} AS r
			JOIN ${membersTableName} AS SM
				ON SM.${membersIdColumnName} = r.source_member_id 
			JOIN ${membersTableName} AS TM
				ON TM.${membersIdColumnName} = r.target_member_id
			WHERE r.${relationshipsIdColumnName} = $1 AND
				TM.${conchesIdColumnName} = $2 AND SM.${conchesIdColumnName} = $2
			`;
			const values = [relationshipId, parsedConchId];

			const queryResponse = await dbPool.query(query, values);
			if (!queryResponse.rowCount)
				throw new AppError(
					`Relationship ${relationshipId} does not exist in this conch.`,
					404,
				);

			const row = relationshipsSchema.parse(queryResponse.rows[0]);

			return res.status(200).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

export const addRelationship =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsedConchId = idSchema.parse(req.params.conchId);

			const {
				relationship_type,
				source_member_id,
				target_member_id,
				is_current,
			} = relationshipsCreateSchema.parse(req.body);

			const query = `
			INSERT INTO ${relationshipsTableName} (
				relationship_type,
				source_member_id,
				target_member_id,
				is_current
			)
			SELECT
				$1,
				source.${membersIdColumnName},
				target.${membersIdColumnName},
				$4
			FROM ${membersTableName} AS source
			JOIN ${membersTableName} AS target
				ON target.${membersIdColumnName} = $3
				AND target.${conchesIdColumnName} = $5
			WHERE source.${membersIdColumnName} = $2
				AND source.${conchesIdColumnName} = $5
			RETURNING *`;
			const values = [
				relationship_type,
				source_member_id,
				target_member_id,
				is_current,
				parsedConchId,
			];

			const queryResponse = await dbPool.query(query, values);
			if (!queryResponse.rowCount)
				throw new AppError(
					"Source and target members of this relationship are not both a part of this conch.",
					400,
				);

			const row = relationshipsSchema.parse(queryResponse.rows[0]);

			return res.status(201).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

export const deleteRelationship =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const relationshipId = idSchema.parse(req.params.relationshipId);
			const parsedConchId = idSchema.parse(req.params.conchId);

			const query = `
				DELETE FROM ${relationshipsTableName} AS r
				USING ${membersTableName} AS sm, ${membersTableName} AS tm
				WHERE r.source_member_id = sm.${membersIdColumnName}
				AND sm.${conchesIdColumnName} = $1
				AND r.target_member_id = tm.${membersIdColumnName}
				AND tm.${conchesIdColumnName} = $1
				AND r.${relationshipsIdColumnName} = $2
				RETURNING r.*
			`;
			const values = [parsedConchId, relationshipId];

			const queryResponse = await dbPool.query(query, values);
			if (!queryResponse.rowCount)
				throw new AppError(
					`Resource with ID ${relationshipId} not found.`,
					404,
				);
			const row = relationshipsSchema.parse(queryResponse.rows[0]);

			return res.status(200).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};

const retrieveUpdateRelationshipQueryAndValues = (
	req: Request,
	relationshipId: number,
	conchId: number,
): BuildQuery => {
	const updateBody = relationshipsUpdateSchema.parse(req.body);
	const entries = Object.entries(updateBody);

	const keys = entries.map(([key]) => key).join(", ");
	const values = entries.map(([, value]) => value);
	const valuePlaceholders = entries.map((_, idx) => `$${idx + 1}`).join(", ");
	const relationshipIdIndex = values.length + 1;
	const sourceMemberIdIndex = values.length + 2;
	const targetMemberIdIndex = values.length + 3;
	const conchIdIndex = values.length + 4;

	const query = `
				UPDATE ${relationshipsTableName} AS r
				SET (${keys}) = (${valuePlaceholders})
				FROM 
					${membersTableName} AS OLD_SM, 
					${membersTableName} AS OLD_TM
				WHERE 
					r.${relationshipsIdColumnName} = $${relationshipIdIndex} AND
					OLD_SM.${conchesIdColumnName} = $${conchIdIndex} AND
					OLD_SM.${membersIdColumnName} = r.source_member_id AND
					OLD_TM.${membersIdColumnName} = r.target_member_id AND
					OLD_TM.${conchesIdColumnName} = $${conchIdIndex}
				AND ($${sourceMemberIdIndex}::integer IS NULL OR $${sourceMemberIdIndex} IN (
					SELECT SM.${membersIdColumnName} FROM ${membersTableName} AS SM
					WHERE SM.${conchesIdColumnName} = $${conchIdIndex}
				))
				AND ($${targetMemberIdIndex}::integer IS NULL OR $${targetMemberIdIndex} IN (
					SELECT TM.${membersIdColumnName} FROM ${membersTableName} AS TM
					WHERE TM.${conchesIdColumnName} = $${conchIdIndex}
				))
				RETURNING r.*
			`;
	const queryValues = [
		...values,
		relationshipId,
		updateBody.source_member_id ?? null,
		updateBody.target_member_id ?? null,
		conchId,
	];

	return { query, values: queryValues };
};

export const updateRelationship =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const relationshipId = idSchema.parse(req.params.relationshipId);
			const parsedConchId = idSchema.parse(req.params.conchId);

			const { query, values } = retrieveUpdateRelationshipQueryAndValues(
				req,
				relationshipId,
				parsedConchId,
			);

			const queryResponse = await dbPool.query(query, values);
			if (!queryResponse.rowCount)
				throw new AppError(
					`Resource with ID ${relationshipId} not found, or an illegal update was attempted`,
					404,
				);
			const row = relationshipsSchema.parse(queryResponse.rows[0]);

			return res.status(200).json(row);
		} catch (err: unknown) {
			return next(err);
		}
	};
