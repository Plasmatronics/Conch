import format from "pg-format";
import { conchesIdColumnName } from "../../schemas";
import { BuildQuery, QueryBuilder } from "../QueryBuilder";
import { SortDirection } from "../../types";
import { tableNameToIdColumnMap } from "../../schemas/shared/mappings";
import {
	CursorOptions,
	ExistsCondition,
	Join,
	JoinCondition,
	ReadCondition,
	ReadQueryParams,
	SelectField,
	SetCondition,
} from "./ReadQueryBuilder.types";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const columnSql = (key: string, tableAlias?: string): string =>
	tableAlias ? format("%I.%I", tableAlias, key) : format("%I", key);

export class ReadQueryBuilder extends QueryBuilder {
	private conditions: ReadCondition[] = [];
	private correlationConditions: JoinCondition[] = [];
	private existsConditions: ExistsCondition[] = [];
	private inConditions: SetCondition[] = [];
	private anyConditions: SetCondition[] = [];
	private selectFields: SelectField[] = [];
	private joins: Join[] = [];
	private tableAlias: string | null = null;
	private pagination: CursorOptions | null = null;
	private limit: number | null = null;
	private sortDirection: SortDirection = "DESC";

	constructor(tableName: string, conchId: string | null | number = null) {
		super(tableName, conchId);
	}

	applyQueryParams(queryParams: ReadQueryParams) {
		const { filters, fields, pagination, limit, sortDir } = queryParams;

		if (fields.length) this.addSelectFields([...fields]);
		if (filters.length) this.addConditions([...filters]);
		if (pagination.keys.length) this.paginate(pagination, sortDir);
		this.addLimit(limit);

		return this;
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

	paginate(options: CursorOptions, sortDir: SortDirection) {
		if (this.pagination)
			throw new Error("Pagination has already been configured");
		this.pagination = options;
		this.sortDirection = sortDir;
		return this;
	}

	addConditions(options: ReadCondition[]) {
		this.conditions.push(...options);
		return this;
	}

	private addCorrelationConditions(conditions: JoinCondition[]) {
		this.correlationConditions.push(...conditions);
		return this;
	}

	addExistsConditions(conditions: ExistsCondition[]) {
		this.existsConditions.push(...conditions);
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

	build(valueOffset = 0): BuildQuery {
		const values: unknown[] = [];
		const conditions: string[] = [];
		let isConchIdIncluded = false;
		const bind = (value: unknown) => {
			values.push(value);
			return `$${valueOffset + values.length}`;
		};

		for (const { key, tableAlias, operator, value } of this.conditions) {
			if (key === conchesIdColumnName) isConchIdIncluded = true;
			const column = columnSql(key, tableAlias);
			conditions.push(`${column} ${operator} ${bind(value)}`);
		}

		for (const { left, right } of this.correlationConditions) {
			conditions.push(
				`${columnSql(left.key, left.tableAlias)} = ${columnSql(right.key, right.tableAlias)}`,
			);
		}

		for (const { key, tableAlias, values: inValues } of this.inConditions) {
			if (!inValues.length) {
				conditions.push("FALSE");
				continue;
			}
			const placeholders = inValues.map(bind);
			conditions.push(
				`${columnSql(key, tableAlias)} IN (${placeholders.join(", ")})`,
			);
		}

		for (const {
			tableName,
			tableAlias,
			joins = [],
			conditions: existsConditions = [],
		} of this.existsConditions) {
			const existsQueryBuilder = new ReadQueryBuilder(tableName);

			if (tableAlias) existsQueryBuilder.addAlias(tableAlias);

			for (const join of joins) existsQueryBuilder.addJoin(join);

			const valueConditions: ReadCondition[] = [];
			const correlationConditions: JoinCondition[] = [];

			for (const condition of existsConditions) {
				if ("left" in condition) correlationConditions.push(condition);
				else valueConditions.push(condition);
			}

			existsQueryBuilder
				.addConditions(valueConditions)
				.addCorrelationConditions(correlationConditions);

			const existsValueOffset = valueOffset + values.length;

			const { query: existsQuery, values: existsValues } =
				existsQueryBuilder.build(existsValueOffset);

			conditions.push(`EXISTS (${existsQuery})`);
			values.push(...existsValues);
		}

		for (const { key, tableAlias, values: anyValues } of this.anyConditions) {
			conditions.push(
				`${columnSql(key, tableAlias)} = ANY(${bind(anyValues)})`,
			);
		}

		if (!isConchIdIncluded && this.conchId !== null) {
			conditions.push(
				`${columnSql(conchesIdColumnName, this.tableAlias ?? undefined)} = ${bind(this.conchId)}`,
			);
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
