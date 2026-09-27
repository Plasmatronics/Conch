import z from "zod";
import { Condition, ConditionOperator, CursorOptions } from "../queries";

export type SortDirection = "ASC" | "DESC";

export interface Field {
	param: string;
	schema: z.ZodType;
}
export interface Filter {
	param: string;
	columnRef: string;
	operator: ConditionOperator;
	schema: z.ZodType;
}

interface MutableQueryParamConfig {
	filters: ReadonlyArray<Filter>;
	fields: ReadonlyArray<Field>;
	sortFields: ReadonlyArray<Field>;

	defaultLimit: number;
	defaultSortDir: SortDirection;
	defaultFields: ReadonlyArray<Field>;
	defaultSortFields: ReadonlyArray<Field>;
}
export type QueryParamConfig = Readonly<MutableQueryParamConfig>;

interface MutableParsedQueryParams {
	filters: ReadonlyArray<Condition>;
	fields: ReadonlyArray<string>;
	pagination: Readonly<CursorOptions>;
	limit: number;
	sortDir: SortDirection;
	rowSchema: Readonly<z.ZodObject<z.ZodRawShape>>;
}
export type ParsedQueryParams = Readonly<MutableParsedQueryParams>;
