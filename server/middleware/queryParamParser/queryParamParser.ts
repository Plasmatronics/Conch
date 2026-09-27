import { NextFunction, Request, Response } from "express";
import {
	ParsedQueryParams,
	QueryParamConfig,
	Filter,
	Field,
} from "../../types";
import { Condition, ConditionOperator, CursorOptions } from "../../queries";
import QueryString from "qs";
import {
	LastSeenIdSchema,
	LimitSchema,
	SortDirectionSchema,
} from "../../schemas";
import { AppError } from "../../errors";
import z from "zod";

const parseFilters = (
	allowedFilter: ReadonlyArray<Filter>,
	enteredFilters: ReadonlyArray<[string, string]>,
): ReadonlyArray<Condition> => {
	const filterMap: Record<
		string,
		[string, ConditionOperator, Filter["schema"]]
	> = {};
	for (const { param, columnRef, schema, operator } of allowedFilter) {
		filterMap[param] = [columnRef, operator, schema];
	}

	const validatedFilters: Condition[] = [];

	for (const [queryKey, queryVal] of enteredFilters) {
		if (!filterMap[queryKey]) continue;

		const [columnRef, operator, schema] = filterMap[queryKey];
		const parsedVal = schema.parse(queryVal);
		validatedFilters.push({
			key: columnRef,
			operator,
			value: parsedVal,
		});
	}

	return validatedFilters;
};

const parseFields = (
	allowedFields: ReadonlyArray<Field>,
	enteredFields: ReadonlyArray<string>,
	defaultFields: ReadonlyArray<Field>,
): {
	schema: ParsedQueryParams["rowSchema"];
	fields: ParsedQueryParams["fields"];
} => {
	const allowedFieldsMap: Record<string, Field["schema"]> = {};
	for (const { param, schema } of allowedFields)
		allowedFieldsMap[param] = schema;

	const parsedFieldsMap = new Map<string, Field["schema"]>();
	for (const field of enteredFields) {
		if (allowedFieldsMap[field])
			parsedFieldsMap.set(field, allowedFieldsMap[field]);
	}
	if (!parsedFieldsMap.size) {
		for (const { param, schema } of defaultFields)
			parsedFieldsMap.set(param, schema);
	}

	return {
		fields: [...parsedFieldsMap.keys()],
		schema: z.object(Object.fromEntries(parsedFieldsMap)),
	};
};

const parseSortFields = (
	allowedFields: ReadonlyArray<Field>,
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

	const allowedFieldMap: Record<Field["param"], Field["schema"]> = {};
	for (const { param, schema } of allowedFields)
		allowedFieldMap[param] = schema;

	const validatedCursorKeys: string[] = [];
	const validatedCursorValues: unknown[] = [];
	for (let i = 0; i < enteredCursorKeys.length; i++) {
		const key = enteredCursorKeys[i];
		if (!allowedFieldMap[key]) continue;
		validatedCursorKeys.push(key);

		const value = enteredCursorValues?.at(i) ?? undefined;
		if (value !== undefined) {
			const parsedValue = allowedFieldMap[key].parse(value);
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

	const { schema, fields: parsedFields } = parseFields(
		allowableFieldsArr,
		String(fields).split(","),
		defaultFields,
	);

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
		rowSchema: schema,
	};

	return parsedQueryParams;
};

export const queryParamParser =
	(queryParamConfig: QueryParamConfig) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const parsedQueryParams = parseQueryParams(queryParamConfig, req.query);
			res.locals.parsedQueryParams = parsedQueryParams;

			next();
		} catch (err) {
			return next(err);
		}
	};
