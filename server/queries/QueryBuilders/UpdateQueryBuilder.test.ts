import { describe, expect, test } from "vitest";
import { normalizeSql } from "../../vitest.setup";
import { UpdateQueryBuilder } from "./UpdateQueryBuilder";

const testTable = "posts";

describe("UpdateQueryBuilder", () => {
	describe("update fields", () => {
		test("throws when no update fields are provided", () => {
			expect(() => new UpdateQueryBuilder(testTable).build()).toThrow(
				"Must provide fields to update",
			);
		});

		test("updates a single field", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1;
				`),
			);

			expect(result.values).toEqual(["Updated title"]);
		});

		test("updates multiple fields", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
					{
						key: "people",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1,
					people = $2;
				`),
			);

			expect(result.values).toEqual(["Updated title", 5]);
		});

		test("accumulates update fields across successive calls", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addUpdateFields([
					{
						key: "people",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1,
					people = $2;
				`),
			);

			expect(result.values).toEqual(["Updated title", 5]);
		});
	});

	describe("conditions", () => {
		test("updates using a single condition", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE post_id = $2;
				`),
			);

			expect(result.values).toEqual(["Updated title", 10]);
		});

		test("updates using multiple conditions", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "status",
						operator: "=",
						value: "active",
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
					UPDATE posts SET
					title = $1
					WHERE status = $2
					AND people > $3;
				`),
			);

			expect(result.values).toEqual(["Updated title", "active", 5]);
		});

		test("supports different condition operators", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "status",
						value: "archived",
					},
				])
				.addConditionFields([
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
					UPDATE posts SET
					status = $1
					WHERE people >= $2
					AND created_at < $3;
				`),
			);

			expect(result.values).toEqual(["archived", 10, 100]);
		});

		test("accumulates conditions across successive calls", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "status",
						operator: "=",
						value: "active",
					},
				])
				.addConditionFields([
					{
						key: "people",
						operator: ">",
						value: 5,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE status = $2
					AND people > $3;
				`),
			);

			expect(result.values).toEqual(["Updated title", "active", 5]);
		});
	});

	describe("conch id", () => {
		test("automatically scopes update by conch id", () => {
			const result = new UpdateQueryBuilder(testTable, "conch-123")
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE conch_id = 'conch-123';
				`),
			);

			expect(result.values).toEqual(["Updated title"]);
		});

		test("adds conch id alongside other conditions", () => {
			const result = new UpdateQueryBuilder(testTable, "conch-123")
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE post_id = $2
					AND conch_id = 'conch-123';
				`),
			);

			expect(result.values).toEqual(["Updated title", 10]);
		});

		test("does not add constructor conch id when condition explicitly includes conch id", () => {
			const result = new UpdateQueryBuilder(testTable, "conch-123")
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "conch_id",
						operator: "=",
						value: "conch-456",
					},
				])
				.build();
			const expected = `
					UPDATE posts SET
					title = $1
					WHERE conch_id = $2;`;

			console.log("ACTUAL:  ", JSON.stringify(result.query));
			console.log("EXPECTED:", JSON.stringify(expected));
			expect(normalizeSql(result.query)).toBe(normalizeSql(expected));

			expect(result.values).toEqual(["Updated title", "conch-456"]);
		});
	});

	describe("returning", () => {
		test("returns a single field", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.returning(["post_id"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE post_id = $2
					RETURNING post_id;
				`),
			);

			expect(result.values).toEqual(["Updated title", 10]);
		});

		test("returns multiple fields", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.returning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE post_id = $2
					RETURNING post_id, title;
				`),
			);

			expect(result.values).toEqual(["Updated title", 10]);
		});

		test("returns all fields using wildcard", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
				])
				.returning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					WHERE post_id = $2
					RETURNING *;
				`),
			);

			expect(result.values).toEqual(["Updated title", 10]);
		});

		test("wildcard overrides previously configured returning fields", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.returning(["post_id", "title"])
				.returning(["*"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					RETURNING *;
				`),
			);
		});

		test("ignores returning fields added after wildcard", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.returning(["*"])
				.returning(["post_id", "title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					RETURNING *;
				`),
			);
		});

		test("accumulates returning fields across successive calls", () => {
			const result = new UpdateQueryBuilder(testTable)
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.returning(["post_id"])
				.returning(["title"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1
					RETURNING post_id, title;
				`),
			);
		});
	});

	describe("combined", () => {
		test("builds an update with multiple fields, conditions, conch scope, and returning fields", () => {
			const result = new UpdateQueryBuilder(testTable, "conch-123")
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
					{
						key: "status",
						value: "archived",
					},
				])
				.addConditionFields([
					{
						key: "post_id",
						operator: "=",
						value: 10,
					},
					{
						key: "people",
						operator: ">",
						value: 5,
					},
				])
				.returning(["post_id", "title", "status"])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
					UPDATE posts SET
					title = $1,
					status = $2
					WHERE post_id = $3
					AND people > $4
					AND conch_id = 'conch-123'
					RETURNING post_id, title, status;
				`),
			);

			expect(result.values).toEqual(["Updated title", "archived", 10, 5]);
		});

		test("uses explicitly provided conch id instead of constructor conch id", () => {
			const result = new UpdateQueryBuilder(testTable, "conch-123")
				.addUpdateFields([
					{
						key: "title",
						value: "Updated title",
					},
				])
				.addConditionFields([
					{
						key: "conch_id",
						operator: "=",
						value: "conch-456",
					},
				])
				.build();

			expect(normalizeSql(result.query)).toBe(
				normalizeSql(`
			UPDATE posts SET
			title = $1
			WHERE conch_id = $2;
		`),
			);

			expect(result.values).toEqual(["Updated title", "conch-456"]);
		});
	});
});
