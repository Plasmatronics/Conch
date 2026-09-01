import { describe, expect, test } from "vitest";
import { normalizeSql } from "../../vitest.setup";
import { ReadQueryBuilder } from "./ReadQueryBuilder";

const testTable = "posts";
const testId = "post_id";

describe("ReadQueryBuilder", () => {
	describe("pagination", () => {
		test("cursor options enforce matching key and value lengths at runtime", () => {
			expect(() =>
				new ReadQueryBuilder(testTable)
					.paginate({
						keys: ["created_at", testId],
						values: [1],
						lastSeenId: 10,
					})
					.build(),
			).toThrow("Cursor keys and values must have matching lengths");
		});

		test("uses the provided id cursor value when id is already included", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at", testId],
					values: [100, 10],
					lastSeenId: 999,
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE (
				created_at < '100'
				OR (
					created_at = '100'
					AND post_id < '10'
				)
			)
			ORDER BY created_at DESC, post_id DESC`),
			);
		});

		test("addPaginates using multiple cursors and hydrates id", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at", "people"],
					values: [100, 5],
					lastSeenId: 10,
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					WHERE (
						created_at < '100'
						OR (
							created_at = '100'
							AND
								(
									people < '5'
									OR (
										people = '5'
										AND post_id < '10'
									)
								)
						)
					)
					ORDER BY created_at DESC, people DESC, post_id DESC`),
			);

			expect(result.values).toEqual([]);
		});

		test("addPaginates using a single cursor and hydrates id", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at"],
					values: [100],
					lastSeenId: 10,
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					WHERE (
						created_at < '100'
						OR (
							created_at = '100'
							AND post_id < '10'
						)
					)
					ORDER BY created_at DESC, post_id DESC`),
			);

			expect(result.values).toEqual([]);
		});

		test("orders by multiple cursors without applying cursor conditions when no values are provided", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at", "people"],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					ORDER BY created_at DESC, people DESC, post_id DESC`),
			);

			expect(result.values).toEqual([]);
		});

		test("orders by a single cursor without applying cursor conditions when no value is provided", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at"],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					ORDER BY created_at DESC, post_id DESC`),
			);

			expect(result.values).toEqual([]);
		});

		test("adds the table id as a cursor tie breaker when it is not included", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at"],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					ORDER BY created_at DESC, ${testId} DESC`),
			);
		});

		test("does not add the table id when it is already included", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at", testId],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					ORDER BY created_at DESC, post_id DESC`),
			);
		});

		test("addPaginates in ascending order", () => {
			const result = new ReadQueryBuilder(testTable, null, "ASC")
				.paginate({
					keys: ["created_at"],
					values: [100],
					lastSeenId: 10,
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE (
				created_at > '100'
				OR (
					created_at = '100'
					AND post_id > '10'
				)
			)
			ORDER BY created_at ASC, post_id ASC`),
			);

			expect(result.values).toEqual([]);
		});

		test("works when no cursor is provided", () => {
			const result = new ReadQueryBuilder(testTable).build();

			expect(normalizeSql(result.query)).toBe(`SELECT * FROM ${testTable}`);

			expect(result.values).toEqual([]);
		});

		test("Throws error on successive pagination", () => {
			expect(() =>
				new ReadQueryBuilder(testTable)
					.paginate({ keys: ["created_at", testId] })
					.paginate({ keys: ["created_at", testId] })
					.build(),
			).toThrow("Pagination has already been configured");
		});

		test("Throws error upon pagination if table doesnt have mapped id", () => {
			const unaddPaginatedRes = new ReadQueryBuilder("bad_table").build();

			expect(normalizeSql(unaddPaginatedRes.query)).toBe(
				normalizeSql(`SELECT * FROM bad_table`),
			);
			expect(unaddPaginatedRes.values).toEqual([]);

			expect(() =>
				new ReadQueryBuilder("bad_table")
					.paginate({ keys: ["created_at", testId] })
					.build(),
			).toThrow(`No ID column configured for table "bad_table"`);
		});
	});

	describe("limit", () => {
		test("uses no limit by default", () => {
			const result = new ReadQueryBuilder(testTable).build();

			expect(normalizeSql(result.query)).toBe(`SELECT * FROM ${testTable}`);
		});

		test("uses a provided limit within the allowed range", () => {
			const result = new ReadQueryBuilder(testTable, null).addLimit(50).build();

			expect(normalizeSql(result.query)).toBe(
				`SELECT * FROM ${testTable} LIMIT 50`,
			);
		});

		test("clamps a limit above the maximum", () => {
			const result = new ReadQueryBuilder(testTable, null)
				.addLimit(103)
				.build();

			expect(normalizeSql(result.query)).toBe(
				`SELECT * FROM ${testTable} LIMIT 100`,
			);
		});

		test("uses the default limit when the provided limit is zero", () => {
			const result = new ReadQueryBuilder(testTable, null).addLimit(0).build();

			expect(normalizeSql(result.query)).toBe(
				`SELECT * FROM ${testTable} LIMIT 25`,
			);
		});

		test("uses the default limit when the provided limit is negative", () => {
			const result = new ReadQueryBuilder(testTable, null).addLimit(-2).build();

			expect(normalizeSql(result.query)).toBe(
				`SELECT * FROM ${testTable} LIMIT 25`,
			);
		});
	});

	describe("filters", () => {
		test("works when no filters nor cursor are added", () => {
			const result = new ReadQueryBuilder(testTable).build();

			expect(result).toEqual({
				query: `SELECT * FROM ${testTable}`,
				values: [],
			});
		});

		test("works when no filters are added", () => {
			const result = new ReadQueryBuilder(testTable)
				.paginate({
					keys: ["created_at"],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					ORDER BY created_at DESC, post_id DESC`),
			);

			expect(result.values).toEqual([]);
		});

		test("applies filters before pagination", () => {
			const result = new ReadQueryBuilder(testTable)
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "active",
					},
				])
				.paginate({
					keys: ["created_at"],
					values: [100],
					lastSeenId: 10,
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					SELECT * FROM posts
					WHERE status = $1
					AND (
						created_at < '100'
						OR (
							created_at = '100'
							AND post_id < '10'
						)
					)
					ORDER BY created_at DESC, post_id DESC`),
			);

			expect(result.values).toEqual(["active"]);
		});

		test("filters by a single condition without pagination", () => {
			const result = new ReadQueryBuilder(testTable)
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "active",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE status = $1`),
			);

			expect(result.values).toEqual(["active"]);
		});

		test("filters by multiple conditions without pagination", () => {
			const result = new ReadQueryBuilder(testTable)
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "active",
					},
					{
						key: "people",
						operator: "=",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE status = $1
			AND people = $2`),
			);

			expect(result.values).toEqual(["active", 5]);
		});

		test("accumulates filters across successive filter calls", () => {
			const result = new ReadQueryBuilder(testTable)
				.addConditions([{ key: "status", operator: "=", value: "active" }])
				.addConditions([{ key: "people", operator: "=", value: 5 }])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE status = $1
			AND people = $2`),
			);

			expect(result.values).toEqual(["active", 5]);
		});

		test("filters and scopes by conch without pagination", () => {
			const result = new ReadQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "active",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE status = $1
			AND conch_id = $2`),
			);

			expect(result.values).toEqual(["active", "conch-123"]);
		});

		test("scopes by conch without pagination nor filtering", () => {
			const result = new ReadQueryBuilder(testTable, "conch-123").build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE conch_id = $1`),
			);

			expect(result.values).toEqual(["conch-123"]);
		});

		test("uses explicitly provided conch id instead of constructor conch id", () => {
			const result = new ReadQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "conch_id",
						operator: "=",
						value: "conch-456",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			SELECT * FROM posts
			WHERE conch_id = $1`),
			);

			expect(result.values).toEqual(["conch-456"]);
		});
	});

	describe("query composition", () => {
		test("joins tables with one or more column conditions", () => {
			const result = new ReadQueryBuilder(testTable)
				.addAlias("p")
				.addJoin({
					tableName: "users",
					alias: "u",
					on: [
						{
							left: { tableAlias: "p", key: "author_id" },
							right: { tableAlias: "u", key: "user_id" },
						},
						{
							left: { tableAlias: "p", key: "conch_id" },
							right: { tableAlias: "u", key: "conch_id" },
						},
					],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT * FROM posts AS p INNER JOIN users AS u ON p.author_id = u.user_id AND p.conch_id = u.conch_id",
			);
		});

		test("supports left joins", () => {
			const result = new ReadQueryBuilder(testTable)
				.addAlias("p")
				.addJoin({
					tableName: "media",
					alias: "photo",
					type: "LEFT",
					on: [
						{
							left: { tableAlias: "p", key: "photo_id" },
							right: { tableAlias: "photo", key: "media_id" },
						},
					],
				})
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT * FROM posts AS p LEFT JOIN media AS photo ON p.photo_id = photo.media_id",
			);
		});

		test("rejects joins without conditions", () => {
			expect(() =>
				new ReadQueryBuilder(testTable).addJoin({
					tableName: "users",
					alias: "u",
					on: [],
				}),
			).toThrow("A join must include at least one condition");
		});

		test("selects aliased fields from an aliased table", () => {
			const result = new ReadQueryBuilder(testTable)
				.addAlias("p")
				.addSelectFields([
					{ tableAlias: "p", key: "post_id", alias: "id" },
					{ tableAlias: "p", key: "title" },
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT p.post_id AS id, p.title FROM posts AS p",
			);
		});

		test("qualifies explicit and automatic conch predicates", () => {
			const result = new ReadQueryBuilder(testTable, "conch-123")
				.addAlias("p")
				.addConditions([
					{ tableAlias: "p", key: "status", operator: "=", value: "active" },
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT * FROM posts AS p WHERE p.status = $1 AND p.conch_id = $2",
			);
			expect(result.values).toEqual(["active", "conch-123"]);
		});

		test("builds IN and ANY predicates with bound values", () => {
			const result = new ReadQueryBuilder(testTable)
				.addInConditions([{ key: "status", values: ["active", "draft"] }])
				.addAnyConditions([{ key: "author_id", values: [1, 2, 3] }])
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT * FROM posts WHERE status IN ($1, $2) AND author_id = ANY($3)",
			);
			expect(result.values).toEqual(["active", "draft", [1, 2, 3]]);
		});

		test("uses false for an empty IN predicate", () => {
			const result = new ReadQueryBuilder(testTable)
				.addInConditions([{ key: "post_id", values: [] }])
				.build();

			expect(normalizeSql(result.query)).toBe(
				"SELECT * FROM posts WHERE FALSE",
			);
		});
	});
});
