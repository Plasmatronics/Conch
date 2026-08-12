import { QueryConfig } from "pg";
import format from "pg-format";

class PrivateCRUDFactory {
	generateGetAll(table: string): QueryConfig {
		const paramterizedQuery = format("SELECT * FROM %I", table);
		return { text: paramterizedQuery, values: [] };
	}

	generateGetOne(table: string, idColumn: string, id: string): QueryConfig {
		const paramterizedQuery = format(
			`SELECT * FROM %I WHERE %I = $1`,
			table,
			idColumn,
		);
		return { text: paramterizedQuery, values: [id] };
	}

	generateUpdateOne(
		table: string,
		valueMap: Record<string, unknown>,
		idColumn: string,
		id: string,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length)
			throw new Error("No columns for updates were entered.");

		const setClause = entries
			.map(([key], i) => format("%I = $%s", key, i + 1))
			.join(", ");

		const query = format(
			"UPDATE %I SET %s WHERE %I = $%s RETURNING *",
			table,
			setClause,
			idColumn,
			entries.length + 1,
		);
		const values = [...entries.map(([, value]) => value), id];
		return { text: query, values };
	}

	generateDeleteOne(table: string, idColumn: string, id: string): QueryConfig {
		const paramterizedQuery = format(
			`DELETE FROM %I WHERE %I = $1 RETURNING *`,
			table,
			idColumn,
		);
		return { text: paramterizedQuery, values: [id] };
	}

	generateCreateOne(
		table: string,
		valueMap: Record<string, unknown>,
	): QueryConfig {
		const entries = Object.entries(valueMap);
		if (!entries.length)
			throw new Error("No columns for creation were entered.");

		const columns = entries.map(([key]) => format("%I", key)).join(", ");
		const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");

		const text = format(
			"INSERT INTO %I (%s) VALUES (%s) RETURNING *",
			table,
			columns,
			placeholders,
		);

		const values = entries.map(([, valueIdx]) => valueIdx);
		return { text, values };
	}
}

export type CRUDFactory = InstanceType<typeof PrivateCRUDFactory>;
export const crudFactory = new PrivateCRUDFactory();
