import { QueryConfig } from "pg";
import format from "pg-format";
import { conchesIdColumnName } from "../schemas";

interface CRUDFactoryConfig {
	tableName: string;
	idColumnName: string;
}

export class CRUDFactory {
	private tableName: string;
	private idColumnName: string;

	constructor({ tableName, idColumnName }: CRUDFactoryConfig) {
		this.tableName = tableName;
		this.idColumnName = idColumnName;
	}

	generateGetAll(conchId?: number): QueryConfig {
		const whereClause = !conchId ? "" : ` WHERE ${conchesIdColumnName} = $1`;
		const parameterizedQuery = format(
			`SELECT * FROM %I${whereClause}`,
			this.tableName,
		);

		return {
			text: parameterizedQuery,
			values: !conchId ? [] : [conchId],
		};
	}

	generateGetOne(resourceId: number, conchId?: number): QueryConfig {
		const conchClause = !conchId ? "" : ` AND ${conchesIdColumnName} = $2`;
		const paramterizedQuery = format(
			`SELECT * FROM %I WHERE %I = $1${conchClause}`,
			this.tableName,
			this.idColumnName,
		);
		return {
			text: paramterizedQuery,
			values: !conchId ? [resourceId] : [resourceId, conchId],
		};
	}

	generateUpdateOne(
		valueMap: Record<string, unknown>,
		resourceId: number,
		conchId?: number,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length)
			throw new Error("No columns for updates were entered.");

		const setClause = entries
			.map(([key], i) => format("%I = $%s", key, i + 1))
			.join(", ");

		const conchClause = !conchId
			? ""
			: ` AND ${conchesIdColumnName} = $${entries.length + 2}`;

		const query = format(
			`UPDATE %I SET %s WHERE %I = $%s${conchClause} RETURNING *`,
			this.tableName,
			setClause,
			this.idColumnName,
			entries.length + 1,
		);

		const values = [...entries.map(([, value]) => value), resourceId];
		if (conchId !== undefined) values.push(conchId);

		return { text: query, values };
	}

	generateDeleteOne(resourceId: number, conchId?: number): QueryConfig {
		const conchClause = !conchId ? "" : ` AND ${conchesIdColumnName} = $2`;
		const paramterizedQuery = format(
			`DELETE FROM %I WHERE %I = $1${conchClause} RETURNING *`,
			this.tableName,
			this.idColumnName,
		);

		return {
			text: paramterizedQuery,
			values: !conchId ? [resourceId] : [resourceId, conchId],
		};
	}

	generateCreateOne(
		valueMap: Record<string, unknown>,
		conchId?: number,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length && conchId === undefined)
			throw new Error("No columns for creation were entered.");
		if (conchId) entries.push([conchesIdColumnName, conchId]);

		const columns = entries.map(([key]) => format("%I", key)).join(", ");
		const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");

		const text = format(
			"INSERT INTO %I (%s) VALUES (%s) RETURNING *",
			this.tableName,
			columns,
			placeholders,
		);

		const values = entries.map(([, valueIdx]) => valueIdx);
		return { text, values };
	}
}
