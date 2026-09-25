import { Condition } from "../QueryBuilder";
import { SortDirection } from "../../types";

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

export interface ReadQueryParams {
	fields: ReadonlyArray<SelectField>;
	filters: ReadonlyArray<Condition>;
	pagination: Readonly<CursorOptions>;
	limit: number;
	sortDir: SortDirection;
}
