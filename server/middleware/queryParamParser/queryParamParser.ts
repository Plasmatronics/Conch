import { NextFunction, Request, Response } from "express";
import {
	ParsedQueryParams,
	QueryParamConfig,
	Filter,
	ParseFunction,
} from "../../types";
import { Condition, ConditionOperator } from "../../queries";
import QueryString from "qs";
import {
	LastSeenIdSchema,
	LimitSchema,
	SortDirectionSchema,
} from "../../schemas";

const parseFilters = (
	allowedFilter: Filter[],
	enteredFilters: [string, string][],
): Condition[] => {
	const filterMap: Record<string, [string, ConditionOperator, ParseFunction]> =
		{};
	for (const { param, columnRef, parseFn, operator } of allowedFilter) {
		filterMap[param] = [columnRef, operator, parseFn];
	}

	const validatedFilters: Condition[] = [];

	for (const [queryKey, queryVal] of enteredFilters) {
		if (!(queryKey in filterMap)) continue;

		const [columnRef, operator, parseFn] = filterMap[queryKey];
		const parsedVal = parseFn(queryVal);
		validatedFilters.push({
			key: columnRef,
			operator,
			value: parsedVal,
		});
	}

	return validatedFilters;
};

const parseFields = (
	allowedFields: string[],
	enteredFields: string[],
): string[] => {
	const allowedFieldsSet = new Set(allowedFields);

	const validatedFields: string[] = [];
	for (const field of enteredFields) {
		if (allowedFieldsSet.has(field)) validatedFields.push(field);
	}

	return validatedFields;
};

export const parseQueryParams = (
	queryParamConfig: QueryParamConfig,
	queryObj: QueryString.ParsedQs,
): ParsedQueryParams => {
	const { fields, sortFields, limit, lastSeenId, sortDir, ...filters } =
		queryObj;
	const {
		filters: allowableFiltersArr,
		fields: allowableFieldsArr,
		sortFields: allowableSortFieldsArr,

		defaultLimit,
		defaultSortDir,
		defaultFields,
		defaultSortFields,
	} = queryParamConfig;

	const parsedFilters = parseFilters(
		allowableFiltersArr,
		Object.entries(filters).map(
			([key, value]) => [key, String(value)] as [string, string],
		),
	);

	let parsedFields = parseFields(allowableFieldsArr, String(fields).split(","));
	if (!parsedFields.length) parsedFields = defaultFields;

	let parsedSortFields = parseFields(
		allowableSortFieldsArr,
		String(sortFields).split(","),
	);
	if (!parsedSortFields.length) parsedSortFields = defaultSortFields;

	const parsedLimit = limit ? LimitSchema.parse(Number(limit)) : defaultLimit;

	const parsedSortDir = sortDir
		? SortDirectionSchema.parse(sortDir)
		: defaultSortDir;

	const parsedQueryParams: ParsedQueryParams = {
		filters: parsedFilters,
		sortFields: parsedSortFields,
		fields: parsedFields,
		limit: parsedLimit,
		sortDir: parsedSortDir,
		lastSeenId: lastSeenId ? LastSeenIdSchema.parse(lastSeenId) : undefined,
	};

	return parsedQueryParams;
};

export const queryParamParser =
	(queryParamConfig: QueryParamConfig) =>
	async (req: Request, res: Response, next: NextFunction) => {
		const parsedQueryParams = parseQueryParams(queryParamConfig, req.query);
		res.locals.parsedQueryParams = parsedQueryParams;

		next();
	};
