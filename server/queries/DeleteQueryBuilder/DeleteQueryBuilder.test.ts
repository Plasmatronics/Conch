import { describe, expect, test } from "vitest";
import { normalizeSql } from "../../vitest.setup";
import { DeleteQueryBuilder } from "./DeleteQueryBuilder";

const testTable = "posts";

describe("DeleteQueryBuilder", () => {
	describe("conditions", () => {
		test("deletes without conditions", () => {
			const result = new DeleteQueryBuilder(testTable).build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
				`),
			);

			expect(result.values).toEqual([]);
		});

		test("deletes using a single condition", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("deletes using multiple conditions", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "archived",
					},
					{
						key: "people",
						operator: ">",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE status = $1
					AND people > $2
				`),
			);

			expect(result.values).toEqual(["archived", 5]);
		});

		test("supports different condition operators", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "people",
						operator: ">=",
						value: 10,
					},
					{
						key: "created_at",
						operator: "<",
						value: 100,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE people >= $1
					AND created_at < $2
				`),
			);

			expect(result.values).toEqual([10, 100]);
		});

		test("accumulates conditions across successive calls", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "archived",
					},
				])
				.addConditions([
					{
						key: "people",
						operator: ">",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE status = $1
					AND people > $2
				`),
			);

			expect(result.values).toEqual(["archived", 5]);
		});
	});

	describe("conch id", () => {
		test("automatically scopes delete by conch id", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123").build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE conch_id = $1
				`),
			);

			expect(result.values).toEqual(["conch-123"]);
		});

		test("adds conch id alongside other conditions", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					AND conch_id = $2
				`),
			);

			expect(result.values).toEqual([10, "conch-123"]);
		});

		test("does not add constructor conch id when condition explicitly includes conch id", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123")
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
					DELETE FROM posts
					WHERE conch_id = $1
				`),
			);

			expect(result.values).toEqual(["conch-456"]);
		});

		test("preserves explicit conch condition alongside other conditions", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
					{
						key: "conch_id",
						operator: "=",
						value: "conch-456",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					AND conch_id = $2
				`),
			);

			expect(result.values).toEqual([10, "conch-456"]);
		});
	});

	describe("returning", () => {
		test("returns a single field", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post_id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING post_id
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("returns multiple fields", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING post_id, title
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("returns all fields using wildcard", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING *
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("wildcard overrides previously configured returning fields", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post_id", "title"])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING *
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("ignores returning fields added after wildcard", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["*"])
				.addReturning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING *
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("wildcard overrides other fields in the same returning call", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post_id", "*", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING *
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("accumulates returning fields across successive calls", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post_id"])
				.addReturning(["title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING post_id, title
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("supports returning without conditions", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addReturning(["post_id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					RETURNING post_id
				`),
			);

			expect(result.values).toEqual([]);
		});
	});

	describe("identifiers", () => {
		test("escapes the table name", () => {
			const result = new DeleteQueryBuilder("post table")
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM "post table"
					WHERE post_id = $1
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("escapes condition field identifiers", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE "post id" = $1
				`),
			);

			expect(result.values).toEqual([10]);
		});

		test("escapes returning field identifiers", () => {
			const result = new DeleteQueryBuilder(testTable)
				.addConditions([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.addReturning(["post title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE post_id = $1
					RETURNING "post title"
				`),
			);

			expect(result.values).toEqual([10]);
		});
	});

	describe("combined", () => {
		test("builds a delete query with multiple conditions, conch scope, and returning fields", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "archived",
					},
					{
						key: "people",
						operator: ">",
						value: 5,
					},
				])
				.addReturning(["post_id", "title", "status"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE status = $1
					AND people > $2
					AND conch_id = $3
					RETURNING post_id, title, status
				`),
			);

			expect(result.values).toEqual(["archived", 5, "conch-123"]);
		});

		test("uses explicitly provided conch id in combined query", () => {
			const result = new DeleteQueryBuilder(testTable, "conch-123")
				.addConditions([
					{
						key: "status",
						operator: "=",
						value: "archived",
					},
					{
						key: "conch_id",
						operator: "=",
						value: "conch-456",
					},
				])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					DELETE FROM posts
					WHERE status = $1
					AND conch_id = $2
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["archived", "conch-456"]);
		});
	});
});
