import { Condition, ConditionOperator } from "../queries";

export type SortDirection = "ASC" | "DESC";
export type ParseFunction = (input: string) => unknown;
export interface Filter {
	param: string;
	columnRef: string;
	operator: ConditionOperator;
	parseFn: ParseFunction;
}

interface MutableQueryParamConfig {
	filters: ReadonlyArray<Filter>;
	fields: ReadonlyArray<string>;
	sortFields: ReadonlyArray<string>;

	defaultLimit: number;
	defaultSortDir: SortDirection;
	defaultFields: ReadonlyArray<string>;
	defaultSortFields: ReadonlyArray<string>;
}
export type QueryParamConfig = Readonly<MutableQueryParamConfig>;

interface MutableParsedQueryParams {
	filters: ReadonlyArray<Condition>;
	fields: ReadonlyArray<string>;
	sortFields: ReadonlyArray<string>;
	limit: number;
	sortDir: SortDirection;
	lastSeenId?: number;
}
export type ParsedQueryParams = Readonly<MutableParsedQueryParams>;
