import type { NextFunction, Request, Response } from "express";
import { describe, expect, test, vi } from "vitest";

import type { ParseFunction, QueryParamConfig } from "../../types";
import { parseQueryParams, queryParamParser } from "./queryParamParser";

const parseNumber = vi.fn((value: string) => Number(value));
const parseString = vi.fn((value: string) => value);

const queryParamConfig: QueryParamConfig = {
	filters: [
		{
			param: "memberId",
			columnRef: "member_id",
			operator: "=",
			parseFn: parseNumber as unknown as ParseFunction,
		},
	],
	fields: ["member_id", "name"],
	sortFields: [
		{ param: "member_id", parseFn: parseNumber },
		{ param: "created_at", parseFn: parseString },
	],
	defaultLimit: 25,
	defaultSortDir: "DESC",
	defaultFields: ["member_id", "name"],
	defaultSortFields: [
		{ param: "member_id", parseFn: (input: string) => parseString },
	],
};

describe("parseQueryParams", () => {
	test("returns configured defaults when query parameters are absent", () => {
		expect(parseQueryParams(queryParamConfig, {})).toEqual({
			filters: [],
			fields: ["member_id", "name"],
			pagination: { keys: ["member_id"] },
			limit: 25,
			sortDir: "DESC",
		});
	});

	test("transforms allowed filters and ignores unknown filters", () => {
		expect(
			parseQueryParams(queryParamConfig, {
				memberId: "42",
				unknown: "value",
			}).filters,
		).toEqual([
			{
				key: "member_id",
				operator: "=",
				value: 42,
			},
		]);
	});

	test("propagates filter parser failures", () => {
		const error = new Error("invalid member ID");
		const config: QueryParamConfig = {
			...queryParamConfig,
			filters: [
				{
					...queryParamConfig.filters[0],
					parseFn: vi.fn(() => {
						throw error;
					}) as unknown as ParseFunction,
				},
			],
		};

		expect(() => parseQueryParams(config, { memberId: "invalid" })).toThrow(
			error,
		);
	});

	test("keeps only allowed response fields", () => {
		expect(
			parseQueryParams(queryParamConfig, {
				fields: "name,password_hash,member_id",
			}).fields,
		).toEqual(["name", "member_id"]);
	});

	test("uses default response fields when none of the requested fields are allowed", () => {
		expect(
			parseQueryParams(queryParamConfig, {
				fields: "password_hash,unknown",
			}).fields,
		).toEqual(["member_id", "name"]);
	});

	test("keeps only allowed sort fields", () => {
		expect(
			parseQueryParams(queryParamConfig, {
				sortKeys: "created_at,password_hash,member_id",
			}).pagination,
		).toEqual({ keys: ["created_at", "member_id"] });
	});

	test("parses cursor values using their sort-field parsers", () => {
		expect(
			parseQueryParams(queryParamConfig, {
				sortKeys: "member_id,created_at",
				cursorVals: ["42", "Smith, Jr."],
				lastSeenId: "91",
			}).pagination,
		).toEqual({
			keys: ["member_id", "created_at"],
			values: [42, "Smith, Jr."],
			lastSeenId: 91,
		});
	});

	test("rejects cursor keys and values with different lengths", () => {
		expect(() =>
			parseQueryParams(queryParamConfig, {
				sortKeys: "member_id,created_at",
				cursorVals: "42",
				lastSeenId: "91",
			}),
		).toThrow("Cursor values and cursor keys must be of the same length");
	});

	test("parses a valid limit from the query string", () => {
		expect(parseQueryParams(queryParamConfig, { limit: "50" }).limit).toBe(50);
	});

	test.each(["0", "101", "invalid"])("rejects invalid limit %s", (limit) => {
		expect(() => parseQueryParams(queryParamConfig, { limit })).toThrow();
	});

	test("accepts an allowed sort direction", () => {
		expect(parseQueryParams(queryParamConfig, { sortDir: "ASC" }).sortDir).toBe(
			"ASC",
		);
	});

	test("rejects an unknown sort direction", () => {
		expect(() =>
			parseQueryParams(queryParamConfig, { sortDir: "ascending" }),
		).toThrow();
	});

	test("rejects cursor values without a last-seen ID", () => {
		expect(() =>
			parseQueryParams(queryParamConfig, {
				sortKeys: "member_id",
				cursorVals: "42",
			}),
		).toThrow(
			"Cursor values must be entered in tandem with lastSeenId or not at all",
		);
	});

	test("rejects a last-seen ID without cursor values", () => {
		expect(() =>
			parseQueryParams(queryParamConfig, {
				sortKeys: "member_id",
				lastSeenId: "91",
			}),
		).toThrow(
			"Cursor values must be entered in tandem with lastSeenId or not at all",
		);
	});

	test("rejects a malformed pagination cursor", () => {
		expect(() =>
			parseQueryParams(queryParamConfig, { lastSeenId: "invalid" }),
		).toThrow();
	});
});

describe("queryParamParser", () => {
	const createRequest = (query: Request["query"] = {}) =>
		({ query }) as unknown as Request;

	const createResponse = () => ({ locals: {} }) as Response;

	test("stores parsed query parameters in response locals", async () => {
		const response = createResponse();
		const next = vi.fn() as unknown as NextFunction;

		await queryParamParser(queryParamConfig)(
			createRequest({
				memberId: "42",
				sortKeys: "member_id",
				cursorVals: "42",
				lastSeenId: "91",
			}),
			response,
			next,
		);

		expect(response.locals.parsedQueryParams).toEqual({
			filters: [{ key: "member_id", operator: "=", value: 42 }],
			fields: ["member_id", "name"],
			pagination: {
				keys: ["member_id"],
				values: [42],
				lastSeenId: 91,
			},
			limit: 25,
			sortDir: "DESC",
		});
	});

	test("continues the middleware chain after parsing", async () => {
		const next = vi.fn() as unknown as NextFunction;

		await queryParamParser(queryParamConfig)(
			createRequest(),
			createResponse(),
			next,
		);

		expect(next).toHaveBeenCalledOnce();
	});
});
