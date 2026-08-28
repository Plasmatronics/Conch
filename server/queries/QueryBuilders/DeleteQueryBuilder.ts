import format from "pg-format";
import { BuildQuery, QueryBuilder, Condition } from "./QueryBuilder";
import { conchesIdColumnName } from "../../schemas";

export class DeleteQueryBuilder extends QueryBuilder {
	private returningFields: string[] = [];
	private conditions: Condition[] = [];

	constructor(tableName: string, conchId: string | null = null) {
		super(tableName, conchId);
	}

	addConditions(fields: Condition[]) {
		this.conditions.push(...fields);
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
		const values: unknown[] = [];

		const conditions: string[] = [];
		let isConchIdIncluded = false;
		for (const { key, operator, value } of this.conditions) {
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
		${format(`DELETE FROM %I `, this.tableName)}
		${conditions.length ? "WHERE " : ""}${conditions.join(" AND ")}
		${returning.length ? "RETURNING " : ""}${returning.join(", ")}`.trim() + ";";

		return {
			query,
			values,
		};
	}
}
