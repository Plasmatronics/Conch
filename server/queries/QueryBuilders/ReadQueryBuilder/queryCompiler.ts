import format from "pg-format";
import { conchesIdColumnName } from "../../../schemas";
import { tableNameToIdColumnMap } from "../../../schemas/shared/mappings";
import { SortDirection } from "../../../types";
import { BuildQuery } from "../QueryBuilder";
import {
	CursorOptions,
	ExistsCondition,
	Join,
	JoinCondition,
	ReadCondition,
	SelectField,
	SetCondition,
} from "./ReadQueryBuilder.types";

interface ReadQuerySpec {
	tableName: string;
	conchId: string | number | null;
	conditions: ReadCondition[];
	correlationConditions: JoinCondition[];
	existsConditions: ExistsCondition[];
	inConditions: SetCondition[];
	anyConditions: SetCondition[];
	selectFields: SelectField[];
	joins: Join[];
	tableAlias: string | null;
	pagination: CursorOptions | null;
	limit: number | null;
	sortDirection: SortDirection;
}

interface BuildContext {
	valueOffset: number;
	values: unknown[];
}

const columnSql = (key: string, tableAlias?: string): string =>
	tableAlias ? format("%I.%I", tableAlias, key) : format("%I", key);

const bind = (context: BuildContext, value: unknown): string => {
	context.values.push(value);
	return `$${context.valueOffset + context.values.length}`;
};

const buildSource = (tableName: string, tableAlias?: string | null): string =>
	`${format("%I", tableName)}${tableAlias ? ` AS ${format("%I", tableAlias)}` : ""}`;

const buildJoin = ({ tableName, alias, type = "INNER", on }: Join): string => {
	if (!on.length) throw new Error("A join must include at least one condition");

	return `${type} JOIN ${format("%I", tableName)} AS ${format("%I", alias)} ON ${on
		.map(
			({ left, right }) =>
				`${columnSql(left.key, left.tableAlias)} = ${columnSql(right.key, right.tableAlias)}`,
		)
		.join(" AND ")}`;
};

const buildReadPredicate = (
	{ key, tableAlias, operator, value }: ReadCondition,
	context: BuildContext,
): string =>
	`${columnSql(key, tableAlias)} ${operator} ${bind(context, value)}`;

const buildCorrelationPredicate = ({ left, right }: JoinCondition): string =>
	`${columnSql(left.key, left.tableAlias)} = ${columnSql(right.key, right.tableAlias)}`;

const buildExistsPredicate = (
	{ tableName, tableAlias, joins = [], conditions = [] }: ExistsCondition,
	context: BuildContext,
): string => {
	const valueConditions: ReadCondition[] = [];
	const correlationConditions: JoinCondition[] = [];

	for (const condition of conditions) {
		if ("left" in condition) correlationConditions.push(condition);
		else valueConditions.push(condition);
	}

	const predicates = [
		...valueConditions.map((condition) =>
			buildReadPredicate(condition, context),
		),
		...correlationConditions.map(buildCorrelationPredicate),
	];
	const query = [
		`SELECT * FROM ${buildSource(tableName, tableAlias)}`,
		joins.map(buildJoin).join(" "),
		predicates.length ? `WHERE ${predicates.join(" AND ")}` : "",
	]
		.filter(Boolean)
		.join(" ");

	return `EXISTS (${query})`;
};

const buildPredicates = (
	spec: ReadQuerySpec,
	context: BuildContext,
): string[] => {
	const predicates = [
		...spec.conditions.map((condition) =>
			buildReadPredicate(condition, context),
		),
		...spec.correlationConditions.map(buildCorrelationPredicate),
	];

	for (const { key, tableAlias, values } of spec.inConditions) {
		if (!values.length) {
			predicates.push("FALSE");
			continue;
		}

		const placeholders = values.map((value) => bind(context, value));
		predicates.push(
			`${columnSql(key, tableAlias)} IN (${placeholders.join(", ")})`,
		);
	}

	for (const condition of spec.existsConditions)
		predicates.push(buildExistsPredicate(condition, context));

	for (const { key, tableAlias, values } of spec.anyConditions) {
		predicates.push(
			`${columnSql(key, tableAlias)} = ANY(${bind(context, values)})`,
		);
	}

	const hasExplicitConchId = spec.conditions.some(
		({ key }) => key === conchesIdColumnName,
	);
	if (!hasExplicitConchId && spec.conchId !== null) {
		predicates.push(
			`${columnSql(conchesIdColumnName, spec.tableAlias ?? undefined)} = ${bind(context, spec.conchId)}`,
		);
	}

	return predicates;
};

const buildCursorCondition = (
	cursor: [string, unknown][],
	sortDirection: SortDirection,
	tableAlias: string | null,
	index = 0,
): string => {
	const [key, value] = cursor[index];
	const operator = sortDirection === "ASC" ? ">" : "<";
	const column = columnSql(key, tableAlias ?? undefined);

	if (index === cursor.length - 1)
		return format("%s %s %L", column, operator, value);

	return format(
		"(%s %s %L OR (%s = %L AND %s))",
		column,
		operator,
		value,
		column,
		value,
		buildCursorCondition(cursor, sortDirection, tableAlias, index + 1),
	);
};

const buildPagination = (spec: ReadQuerySpec) => {
	if (!spec.pagination) return { predicate: "", orderBy: "" };

	const cursorKeys = [...spec.pagination.keys];
	const cursorValues = spec.pagination.values
		? [...spec.pagination.values]
		: undefined;

	if (cursorValues !== undefined && cursorKeys.length !== cursorValues.length)
		throw new Error("Cursor keys and values must have matching lengths");

	const idKey = tableNameToIdColumnMap[spec.tableName];
	if (!idKey)
		throw new Error(`No ID column configured for table "${spec.tableName}"`);

	if (!cursorKeys.includes(idKey)) {
		cursorKeys.push(idKey);
		if (cursorValues) cursorValues.push(spec.pagination.lastSeenId);
	}

	const cursor = cursorValues
		? cursorKeys.map(
				(key, index) => [key, cursorValues[index]] as [string, unknown],
			)
		: undefined;

	return {
		predicate: cursor
			? buildCursorCondition(cursor, spec.sortDirection, spec.tableAlias)
			: "",
		orderBy: `ORDER BY ${cursorKeys
			.map(
				(key) =>
					`${columnSql(key, spec.tableAlias ?? undefined)} ${spec.sortDirection}`,
			)
			.join(", ")}`,
	};
};

export const compileReadQuery = (
	spec: ReadQuerySpec,
	valueOffset = 0,
): BuildQuery => {
	const context: BuildContext = { valueOffset, values: [] };
	const predicates = buildPredicates(spec, context);
	const { predicate: cursorPredicate, orderBy } = buildPagination(spec);
	if (cursorPredicate) predicates.push(cursorPredicate);

	const projection = spec.selectFields.length
		? spec.selectFields
				.map(
					({ key, tableAlias, alias }) =>
						`${columnSql(key, tableAlias)}${alias ? ` AS ${format("%I", alias)}` : ""}`,
				)
				.join(", ")
		: "*";
	const query = [
		`SELECT ${projection} FROM ${buildSource(spec.tableName, spec.tableAlias)}`,
		spec.joins.map(buildJoin).join(" "),
		predicates.length ? `WHERE ${predicates.join(" AND ")}` : "",
		orderBy,
		spec.limit ? `LIMIT ${spec.limit}` : "",
	]
		.filter(Boolean)
		.join(" ");

	return { query, values: context.values };
};
