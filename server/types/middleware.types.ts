import { Condition, ConditionOperator, CursorOptions } from "../queries";

export type SortDirection = "ASC" | "DESC";
export type ParseFunction = (input: string) => unknown;

export interface SortField {
	param: string;
	parseFn: ParseFunction;
}
export interface Filter {
	param: string;
	columnRef: string;
	operator: ConditionOperator;
	parseFn: ParseFunction;
}

interface MutableQueryParamConfig {
	filters: ReadonlyArray<Filter>;
	fields: ReadonlyArray<string>;
	sortFields: ReadonlyArray<SortField>;

	defaultLimit: number;
	defaultSortDir: SortDirection;
	defaultFields: ReadonlyArray<string>;
	defaultSortFields: ReadonlyArray<SortField>;
}
export type QueryParamConfig = Readonly<MutableQueryParamConfig>;

interface MutableParsedQueryParams {
	filters: ReadonlyArray<Condition>;
	fields: ReadonlyArray<string>;
	sortFields: Readonly<CursorOptions>;
	limit: number;
	sortDir: SortDirection;
}
export type ParsedQueryParams = Readonly<MutableParsedQueryParams>;
