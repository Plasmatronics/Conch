import { NextFunction, Request, Response } from "express";
import {
	ParsedQueryParams,
	QueryParamConfig,
	Filter,
	ParseFunction,
	SortField,
} from "../../types";
import { Condition, ConditionOperator, CursorOptions } from "../../queries";
import QueryString from "qs";
import {
	LastSeenIdSchema,
	LimitSchema,
	SortDirectionSchema,
} from "../../schemas";
import { AppError } from "../../errors";

const parseFilters = (
	allowedFilter: ReadonlyArray<Filter>,
	enteredFilters: ReadonlyArray<[string, string]>,
): ReadonlyArray<Condition> => {
	const filterMap: Record<string, [string, ConditionOperator, ParseFunction]> =
		{};
	for (const { param, columnRef, parseFn, operator } of allowedFilter) {
		filterMap[param] = [columnRef, operator, parseFn];
	}

	const validatedFilters: Condition[] = [];

	for (const [queryKey, queryVal] of enteredFilters) {
		if (!filterMap[queryKey]) continue;

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
	allowedFields: ReadonlyArray<string>,
	enteredFields: ReadonlyArray<string>,
): ReadonlyArray<string> => {
	const allowedFieldsSet = new Set(allowedFields);

	const validatedFields: string[] = [];
	for (const field of enteredFields) {
		if (allowedFieldsSet.has(field)) validatedFields.push(field);
	}

	return validatedFields;
};

const parseSortFields = (
	allowedFields: ReadonlyArray<SortField>,
	enteredCursorKeys: string[],
	enteredCursorValues?: string[],
	lastSeenId?: number,
): Readonly<CursorOptions> => {
	if (
		enteredCursorValues &&
		enteredCursorKeys.length !== enteredCursorValues.length
	)
		throw new AppError(
			"Cursor values and cursor keys must be of the same length, or cursor values should be omitted entirely.",
			400,
		);
	if (
		(enteredCursorValues !== undefined && lastSeenId === undefined) ||
		(lastSeenId !== undefined && enteredCursorValues === undefined)
	)
		throw new AppError(
			"Cursor values must be entered in tandem with lastSeenId or not at all",
			400,
		);

	const allowedFieldMap: Record<SortField["param"], SortField["parseFn"]> = {};
	for (const { param, parseFn } of allowedFields)
		allowedFieldMap[param] = parseFn;

	const validatedCursorKeys: string[] = [];
	const validatedCursorValues: unknown[] = [];
	for (let i = 0; i < enteredCursorKeys.length; i++) {
		const key = enteredCursorKeys[i];
		if (!allowedFieldMap[key]) continue;
		validatedCursorKeys.push(key);

		const value = enteredCursorValues?.at(i) ?? undefined;
		if (value !== undefined) {
			const parsedValue = allowedFieldMap[key](value);
			validatedCursorValues.push(parsedValue);
		}
	}

	return validatedCursorValues.length
		? {
				keys: validatedCursorKeys,
				values: validatedCursorValues,
				lastSeenId: lastSeenId!,
			}
		: { keys: validatedCursorKeys };
};

export const parseQueryParams = (
	queryParamConfig: QueryParamConfig,
	queryObj: QueryString.ParsedQs,
): ParsedQueryParams => {
	const {
		fields,
		sortKeys,
		cursorVals,
		limit,
		lastSeenId,
		sortDir,
		...filters
	} = queryObj;
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

	let parsedSortFields = parseSortFields(
		allowableSortFieldsArr,
		String(sortKeys).split(","),
		cursorVals
			? Array.isArray(cursorVals)
				? cursorVals.map(String)
				: [String(cursorVals)]
			: undefined,
		lastSeenId ? LastSeenIdSchema.parse(lastSeenId) : undefined,
	);
	if (!parsedSortFields.keys.length)
		parsedSortFields = {
			keys: defaultSortFields.map((fieldObj) => fieldObj.param),
		};

	const parsedLimit = limit ? LimitSchema.parse(limit) : defaultLimit;

	const parsedSortDir = sortDir
		? SortDirectionSchema.parse(sortDir)
		: defaultSortDir;

	const parsedQueryParams: ParsedQueryParams = {
		filters: parsedFilters,
		pagination: parsedSortFields,
		fields: parsedFields,
		limit: parsedLimit,
		sortDir: parsedSortDir,
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
