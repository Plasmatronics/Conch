import format from "pg-format";
import { BuildQuery, KeyValuePair, QueryBuilder } from "./QueryBuilder";
import { conchesIdColumnName } from "../../schemas";

export class CreateQueryBuilder extends QueryBuilder {
	private returningFields: string[] = [];
	private createFields: KeyValuePair[] = [];
	private createRows: KeyValuePair[][] = [];

	constructor(tableName: string, conchId: string | null | number = null) {
		super(tableName, conchId);
	}

	addCreateFields(fields: KeyValuePair[]) {
		this.createFields.push(...fields);
		return this;
	}

	addCreateRows(rows: KeyValuePair[][]) {
		this.createRows.push(...rows);
		return this;
	}

	addReturning(keys: string[]) {
		if (this.returningFields[0] === "*") return this;

		for (const key of keys) {
			if (key === "*") {
				this.returningFields = ["*"];
				break;
			}
			this.returningFields.push(key);
		}

		return this;
	}

	build(): BuildQuery {
		if (this.createFields.length && this.createRows.length)
			throw new Error("Cannot combine create fields and create rows");

		const rows = this.createRows.length ? this.createRows : [this.createFields];
		if (!rows[0].length) throw new Error("Must insert fields for creation");

		const values: unknown[] = [];
		const insertionKeys = rows[0].map(({ key }) => key);
		const includesConchId = insertionKeys.includes(conchesIdColumnName);
		if (!includesConchId && this.conchId !== null)
			insertionKeys.push(conchesIdColumnName);

		const insertionValues = rows.map((row) => {
			if (
				row.length !== rows[0].length ||
				row.some(({ key }, index) => key !== rows[0][index].key)
			) {
				throw new Error(
					"All create rows must use the same fields in the same order",
				);
			}

			const placeholders = row.map(({ value }) => {
				values.push(value);
				return `$${values.length}`;
			});
			if (!includesConchId && this.conchId !== null) {
				values.push(this.conchId);
				placeholders.push(`$${values.length}`);
			}
			return `(${placeholders.join(", ")})`;
		});

		const returning = this.returningFields.map((key) =>
			key === "*" ? "*" : format("%I", key),
		);

		const query = `
		${format(`INSERT INTO %I `, this.tableName)}
		(${insertionKeys.map((key) => format("%I", key)).join(", ")})
		VALUES ${insertionValues.join(", ")}
		${returning.length ? `RETURNING ${returning.join(", ")}` : ""}
		`.trim();

		return {
			query,
			values,
		};
	}
}
