import { describe, expect, test } from "vitest";
import { normalizeSql } from "../../vitest.setup";
import { CreateQueryBuilder } from "./CreateQueryBuilder";

const testTable = "posts";

describe("CreateQueryBuilder", () => {
	describe("create fields", () => {
		test("throws when no create fields are provided", () => {
			expect(() => new CreateQueryBuilder(testTable).build()).toThrow(
				"Must insert fields for creation",
			);
		});

		test("creates using a single field", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("creates using multiple fields", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
					{
						key: "people",
						value: 5,
					},
					{
						key: "status",
						value: "active",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, people, status)
					VALUES ($1, $2, $3)
				`),
			);

			expect(result.values).toEqual(["Test post", 5, "active"]);
		});

		test("accumulates create fields across successive calls", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addCreateFields([
					{
						key: "people",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, people)
					VALUES ($1, $2)
				`),
			);

			expect(result.values).toEqual(["Test post", 5]);
		});

		test("preserves insertion field order", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{ key: "status", value: "active" },
					{ key: "title", value: "Test post" },
					{ key: "people", value: 5 },
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(status, title, people)
					VALUES ($1, $2, $3)
				`),
			);

			expect(result.values).toEqual(["active", "Test post", 5]);
		});

		test("supports null values", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: null,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
				`),
			);

			expect(result.values).toEqual([null]);
		});
	});

	describe("conch id", () => {
		test("automatically inserts conch id when provided", () => {
			const result = new CreateQueryBuilder(testTable, "conch-123")
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, conch_id)
					VALUES ($1, $2)
				`),
			);

			expect(result.values).toEqual(["Test post", "conch-123"]);
		});

		test("does not insert constructor conch id when create fields explicitly include conch id", () => {
			const result = new CreateQueryBuilder(testTable, "conch-123")
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
					{
						key: "conch_id",
						value: "conch-456",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, conch_id)
					VALUES ($1, $2)
				`),
			);

			expect(result.values).toEqual(["Test post", "conch-456"]);
		});

		test("works without a conch id", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("appends conch id after explicitly provided create fields", () => {
			const result = new CreateQueryBuilder(testTable, "conch-123")
				.addCreateFields([
					{ key: "title", value: "Test post" },
					{ key: "people", value: 5 },
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, people, conch_id)
					VALUES ($1, $2, $3)
				`),
			);

			expect(result.values).toEqual(["Test post", 5, "conch-123"]);
		});
	});

	describe("returning", () => {
		test("returns a single field", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post_id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING post_id
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("returns multiple fields", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING post_id, title
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("returns all fields using wildcard", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("wildcard overrides previously configured returning fields", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post_id", "title"])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("ignores returning fields added after wildcard", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["*"])
				.addReturning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("wildcard overrides other fields in the same returning call", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post_id", "*", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("accumulates returning fields across successive calls", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post_id"])
				.addReturning(["title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING post_id, title
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});
	});

	describe("identifiers", () => {
		test("escapes the table name", () => {
			const result = new CreateQueryBuilder("post table")
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO "post table"
					(title)
					VALUES ($1)
				`),
			);
		});

		test("escapes create field identifiers", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "post title",
						value: "Test post",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					("post title")
					VALUES ($1)
				`),
			);

			expect(result.values).toEqual(["Test post"]);
		});

		test("escapes returning field identifiers", () => {
			const result = new CreateQueryBuilder(testTable)
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
				])
				.addReturning(["post id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title)
					VALUES ($1)
					RETURNING "post id"
				`),
			);
		});
	});

	describe("combined", () => {
		test("builds a create query with multiple fields, conch scope, and returning fields", () => {
			const result = new CreateQueryBuilder(testTable, "conch-123")
				.addCreateFields([
					{
						key: "title",
						value: "Test post",
					},
					{
						key: "people",
						value: 5,
					},
					{
						key: "status",
						value: "active",
					},
				])
				.addReturning(["post_id", "title", "conch_id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, people, status, conch_id)
					VALUES ($1, $2, $3, $4)
					RETURNING post_id, title, conch_id
				`),
			);

			expect(result.values).toEqual(["Test post", 5, "active", "conch-123"]);
		});

		test("uses explicitly provided conch id in combined query", () => {
			const result = new CreateQueryBuilder(testTable, "conch-123")
				.addCreateFields([
					{ key: "title", value: "Test post" },
					{ key: "conch_id", value: "conch-456" },
				])
				.addReturning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					INSERT INTO posts
					(title, conch_id)
					VALUES ($1, $2)
					RETURNING *
				`),
			);

			expect(result.values).toEqual(["Test post", "conch-456"]);
		});
	});
});
