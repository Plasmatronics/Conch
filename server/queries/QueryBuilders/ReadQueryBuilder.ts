import format from "pg-format";
import { conchesIdColumnName, tableNameToIdColumnMap } from "../../schemas";
import { BuildQuery, Condition, QueryBuilder } from "./QueryBuilder";

type SortDirection = "ASC" | "DESC";

type CursorOptions =
	| {
			keys: string[];
			values?: never;
			lastSeenId?: never;
	  }
	| {
			keys: string[];
			values: unknown[];
			lastSeenId: number;
	  };

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export class ReadQueryBuilder extends QueryBuilder {
	private conditions: Condition[] = [];
	private pagination: CursorOptions | null = null;
	private limit: number | null = null;

	constructor(
		tableName: string,
		conchId: string | null | number = null,
		private sortDirection: SortDirection = "DESC",
	) {
		super(tableName, conchId);
	}

	paginate(options: CursorOptions) {
		if (this.pagination)
			throw new Error(`Pagination has already been configured`);
		this.pagination = options;
		return this;
	}

	addConditions(options: Condition[]) {
		this.conditions.push(...options);
		return this;
	}

	addLimit(limitAmt: number = DEFAULT_LIMIT) {
		if (limitAmt > MAX_LIMIT) this.limit = MAX_LIMIT;
		else if (limitAmt <= 0) this.limit = DEFAULT_LIMIT;
		else this.limit = limitAmt;

		return this;
	}

	private buildCursorCondition(cursor: [string, unknown][], index = 0): string {
		const [key, value] = cursor[index];

		const operator = this.sortDirection === "ASC" ? ">" : "<";

		if (index === cursor.length - 1) {
			return format("%I %s %L", key, operator, value);
		}

		return format(
			"(%I %s %L OR (%I = %L AND %s))",
			key,
			operator,
			value,
			key,
			value,
			this.buildCursorCondition(cursor, index + 1),
		);
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
			conditions.push(`${conchesIdColumnName} = $${values.length + 1}`);
			values.push(this.conchId);
		}

		const orderArr: string[] = [];
		if (this.pagination) {
			const cursorKeys = [...this.pagination.keys];
			const cursorValues = this.pagination.values
				? [...this.pagination.values]
				: undefined;
			if (
				cursorValues !== undefined &&
				cursorKeys.length !== cursorValues.length
			)
				throw new Error("Cursor keys and values must have matching lengths");

			const idKey = tableNameToIdColumnMap[this.tableName];

			if (!idKey) {
				throw new Error(
					`No ID column configured for table "${this.tableName}"`,
				);
			}

			if (!cursorKeys.includes(idKey)) {
				cursorKeys.push(idKey);

				if (cursorValues) {
					cursorValues.push(this.pagination.lastSeenId);
				}
			}

			if (cursorValues) {
				const cursor = cursorKeys.map(
					(key, index) => [key, cursorValues[index]] as [string, unknown],
				);

				conditions.push(this.buildCursorCondition(cursor));
			}

			for (const key of cursorKeys) {
				orderArr.push(format("%I %s", key, this.sortDirection));
			}
		}

		const query = `
				${format(`SELECT * FROM %I `, this.tableName)}
				${conditions.length ? "WHERE " : ""}${conditions.join(" AND ")}
				${orderArr.length ? "ORDER BY " : ""}${orderArr.join(", ")}
				${this.limit ? `LIMIT ${this.limit}` : ""}`.trim();

		return { query, values };
	}
}
