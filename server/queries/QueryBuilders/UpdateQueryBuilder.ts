import format from "pg-format";
import {
	BuildQuery,
	KeyValuePair,
	QueryBuilder,
	UpdateDeleteCondition,
} from "./QueryBuilder";
import { conchesIdColumnName } from "../../schemas";

export class UpdateQueryBuilder extends QueryBuilder {
	private returningFields: string[] = [];
	private updateFields: KeyValuePair[] = [];
	private conditionFields: UpdateDeleteCondition[] = [];

	constructor(tableName: string, conchId: string | null = null) {
		super(tableName, conchId);
	}

	addUpdateFields(fields: KeyValuePair[]) {
		this.updateFields.push(...fields);
		return this;
	}

	addConditionFields(fields: UpdateDeleteCondition[]) {
		this.conditionFields.push(...fields);
		return this;
	}

	returning(keys: string[]) {
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
		if (!this.updateFields.length)
			throw new Error("Must provide fields to update");

		const values: unknown[] = [];

		const updateStrs: string[] = [];
		for (const { key, value } of this.updateFields) {
			const updateStr = format(`%I = $${values.length + 1}`, key);
			updateStrs.push(updateStr);
			values.push(value);
		}

		const conditions: string[] = [];
		let isConchIdIncluded = false;
		for (const { key, operator, value } of this.conditionFields) {
			if (key === conchesIdColumnName) isConchIdIncluded = true;
			const conditionStr = format(`%I ${operator} $${values.length + 1}`, key);
			conditions.push(conditionStr);
			values.push(value);
		}
		if (!isConchIdIncluded && this.conchId !== null) {
			conditions.push(format(`${conchesIdColumnName} = %L`, this.conchId));
		}

		const returning = this.returningFields.map((key) =>
			key === "*" ? "*" : format("%I", key),
		);

		const query =
			`
		${format(`UPDATE %I SET `, this.tableName)}
		${updateStrs.join(", ")}
		${conditions.length ? "WHERE " : ""}${conditions.join(" AND ")}
		${returning.length ? "RETURNING " : ""}${returning.join(", ")}`.trim() + ";";

		return {
			query,
			values,
		};
	}
}
