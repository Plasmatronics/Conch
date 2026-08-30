import format from "pg-format";
import { BuildQuery, KeyValuePair, QueryBuilder } from "./QueryBuilder";
import { conchesIdColumnName } from "../../schemas";

export class CreateQueryBuilder extends QueryBuilder {
	private returningFields: string[] = [];
	private createFields: KeyValuePair[] = [];

	constructor(tableName: string, conchId: string | null | number = null) {
		super(tableName, conchId);
	}

	addCreateFields(fields: KeyValuePair[]) {
		this.createFields.push(...fields);
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
		if (!this.createFields.length)
			throw new Error("Must insert fields for creation");

		const values: unknown[] = [];

		const insertionKeys: string[] = [];
		const insertionValues: string[] = [];

		let isConchIdIncluded = false;
		for (const { key, value } of this.createFields) {
			if (key === conchesIdColumnName) isConchIdIncluded = true;

			insertionKeys.push(format("%I", key));
			insertionValues.push(`$${values.length + 1}`);
			values.push(value);
		}
		if (!isConchIdIncluded && this.conchId !== null) {
			insertionKeys.push(conchesIdColumnName);
			insertionValues.push(`$${values.length + 1}`);
			values.push(this.conchId);
		}

		const returning = this.returningFields.map((key) =>
			key === "*" ? "*" : format("%I", key),
		);

		const query = `
		${format(`INSERT INTO %I `, this.tableName)}
		(${insertionKeys.join(", ")}) 
		VALUES (${insertionValues.join(", ")})
		${returning.length ? `RETURNING ${returning.join(", ")}` : ""}
		`.trim();

		return {
			query,
			values,
		};
	}
}
