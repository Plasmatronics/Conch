import { Condition, ConditionOperator } from "../queries";

export type SortDirection = "ASC" | "DESC";
export type ParseFunction = <ParsedVal>(input: string) => ParsedVal;
export interface Filter {
	param: string;
	columnRef: string;
	operator: ConditionOperator;
	parseFn: ParseFunction;
}

export interface QueryParamConfig {
	filters: Filter[];
	fields: string[];
	sortFields: string[];

	defaultLimit: number;
	defaultSortDir: SortDirection;
	defaultFields: string[];
	defaultSortFields: string[];
}

export interface ParsedQueryParams {
	filters: Condition[];
	fields: string[];
	sortFields: string[];
	limit: number;
	sortDir: SortDirection;
	lastSeenId?: number;
}
