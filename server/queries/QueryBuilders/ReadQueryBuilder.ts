import format from "pg-format";
import { conchesIdColumnName, tableNameToIdColumnMap } from "../../schemas";
import { BuildQuery, Condition, QueryBuilder } from "./QueryBuilder";

export type SortDirection = "ASC" | "DESC";

export interface ColumnReference {
	key: string;
	tableAlias?: string;
}

export interface SelectField extends ColumnReference {
	alias?: string;
}

export interface ReadCondition extends Condition {
	tableAlias?: string;
}

export interface SetCondition {
	key: string;
	tableAlias?: string;
	values: unknown[];
}

export interface JoinCondition {
	left: ColumnReference;
	right: ColumnReference;
}

export interface Join {
	tableName: string;
	alias: string;
	type?: "INNER" | "LEFT";
	on: JoinCondition[];
}

export type CursorOptions =
	| { keys: string[]; values?: never; lastSeenId?: never }
	| { keys: string[]; values: unknown[]; lastSeenId: number };

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const columnSql = (key: string, tableAlias?: string): string =>
	tableAlias ? format("%I.%I", tableAlias, key) : format("%I", key);

export class ReadQueryBuilder extends QueryBuilder {
	private conditions: ReadCondition[] = [];
	private inConditions: SetCondition[] = [];
	private anyConditions: SetCondition[] = [];
	private selectFields: SelectField[] = [];
	private joins: Join[] = [];
	private tableAlias: string | null = null;
	private pagination: CursorOptions | null = null;
	private limit: number | null = null;

	constructor(
		tableName: string,
		conchId: string | null | number = null,
		private sortDirection: SortDirection = "DESC",
	) {
		super(tableName, conchId);
	}

	addAlias(alias: string) {
		if (this.tableAlias)
			throw new Error("A table alias has already been configured");
		this.tableAlias = alias;
		return this;
	}

	addSelectFields(fields: SelectField[]) {
		this.selectFields.push(...fields);
		return this;
	}

	addJoin(join: Join) {
		if (!join.on.length)
			throw new Error("A join must include at least one condition");
		this.joins.push(join);
		return this;
	}

	paginate(options: CursorOptions) {
		if (this.pagination)
			throw new Error("Pagination has already been configured");
		this.pagination = options;
		return this;
	}

	addConditions(options: ReadCondition[]) {
		this.conditions.push(...options);
		return this;
	}

	addInConditions(conditions: SetCondition[]) {
		this.inConditions.push(...conditions);
		return this;
	}

	addAnyConditions(conditions: SetCondition[]) {
		this.anyConditions.push(...conditions);
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
		const column = columnSql(key, this.tableAlias ?? undefined);

		if (index === cursor.length - 1)
			return format("%s %s %L", column, operator, value);

		return format(
			"(%s %s %L OR (%s = %L AND %s))",
			column,
			operator,
			value,
			column,
			value,
			this.buildCursorCondition(cursor, index + 1),
		);
	}

	build(): BuildQuery {
		const values: unknown[] = [];
		const conditions: string[] = [];
		let isConchIdIncluded = false;

		for (const { key, tableAlias, operator, value } of this.conditions) {
			if (key === conchesIdColumnName) isConchIdIncluded = true;
			const column = columnSql(key, tableAlias);
			conditions.push(`${column} ${operator} $${values.length + 1}`);
			values.push(value);
		}

		for (const { key, tableAlias, values: inValues } of this.inConditions) {
			if (!inValues.length) {
				conditions.push("FALSE");
				continue;
			}
			const placeholders = inValues.map((value) => {
				values.push(value);
				return `$${values.length}`;
			});
			conditions.push(
				`${columnSql(key, tableAlias)} IN (${placeholders.join(", ")})`,
			);
		}

		for (const { key, tableAlias, values: anyValues } of this.anyConditions) {
			values.push(anyValues);
			conditions.push(`${columnSql(key, tableAlias)} = ANY($${values.length})`);
		}

		if (!isConchIdIncluded && this.conchId !== null) {
			conditions.push(
				`${columnSql(conchesIdColumnName, this.tableAlias ?? undefined)} = $${values.length + 1}`,
			);
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
			if (!idKey)
				throw new Error(
					`No ID column configured for table "${this.tableName}"`,
				);
			if (!cursorKeys.includes(idKey)) {
				cursorKeys.push(idKey);
				if (cursorValues) cursorValues.push(this.pagination.lastSeenId);
			}
			if (cursorValues) {
				const cursor = cursorKeys.map(
					(key, index) => [key, cursorValues[index]] as [string, unknown],
				);
				conditions.push(this.buildCursorCondition(cursor));
			}
			for (const key of cursorKeys)
				orderArr.push(
					`${columnSql(key, this.tableAlias ?? undefined)} ${this.sortDirection}`,
				);
		}

		const projection = this.selectFields.length
			? this.selectFields
					.map(
						({ key, tableAlias, alias }) =>
							`${columnSql(key, tableAlias)}${alias ? ` AS ${format("%I", alias)}` : ""}`,
					)
					.join(", ")
			: "*";
		const source = `${format("%I", this.tableName)}${this.tableAlias ? ` AS ${format("%I", this.tableAlias)}` : ""}`;
		const joins = this.joins.map(
			({ tableName, alias, type = "INNER", on }) =>
				`${type} JOIN ${format("%I", tableName)} AS ${format("%I", alias)} ON ${on
					.map(
						({ left, right }) =>
							`${columnSql(left.key, left.tableAlias)} = ${columnSql(right.key, right.tableAlias)}`,
					)
					.join(" AND ")}`,
		);
		const query = [
			`SELECT ${projection} FROM ${source}`,
			joins.join(" "),
			conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
			orderArr.length ? `ORDER BY ${orderArr.join(", ")}` : "",
			this.limit ? `LIMIT ${this.limit}` : "",
		]
			.filter(Boolean)
			.join(" ");

		return { query, values };
	}
}
