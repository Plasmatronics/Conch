import { describe, expect, test } from "vitest";
import { CRUDFactory } from "./CRUDFactory";
import { normalizeSql } from "../vitest.setup";

const crudFactory = new CRUDFactory({
	tableName: "users",
	idColumnName: "user_id",
});

describe("crudFactory", () => {
	describe("generateGetAll", () => {
		test("scopes results to a conch when a conch ID is provided", () => {
			const result = crudFactory.generateGetAll(7);

			expect(result).toEqual({
				query: "SELECT * FROM users WHERE conch_id = $1",
				values: [7],
			});
		});

		test("generates a query to retrieve all rows from a table", () => {
			const result = crudFactory.generateGetAll();

			expect(result).toEqual({
				query: "SELECT * FROM users",
				values: [],
			});
		});

		test("escapes the table identifier", () => {
			const result = new CRUDFactory({
				tableName: "user accounts",
				idColumnName: "user_id",
			}).generateGetAll();

			expect(result).toEqual({
				query: 'SELECT * FROM "user accounts"',
				values: [],
			});
		});
	});

	describe("generateGetOne", () => {
		test("scopes one resource to a conch", () => {
			const result = new CRUDFactory({
				tableName: "members",
				idColumnName: "member_id",
			}).generateGetOne(123, 7);

			expect(result).toEqual({
				query: "SELECT * FROM members WHERE member_id = $1 AND conch_id = $2",
				values: [123, 7],
			});
		});

		test("generates a parameterized query to retrieve one row", () => {
			const result = crudFactory.generateGetOne(123);

			expect(result).toEqual({
				query: "SELECT * FROM users WHERE user_id = $1",
				values: [123],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = new CRUDFactory({
				tableName: "user accounts",
				idColumnName: "user id",
			}).generateGetOne(123);

			expect(result).toEqual({
				query: 'SELECT * FROM "user accounts" WHERE "user id" = $1',
				values: [123],
			});
		});

		test("does not interpolate the id directly into the query", () => {
			const maliciousId = 999;

			const result = crudFactory.generateGetOne(maliciousId);

			expect(result.query).toBe("SELECT * FROM users WHERE user_id = $1");
			expect(result.values).toEqual([maliciousId]);
			expect(result.query).not.toContain(maliciousId);
		});
	});

	describe("generateUpdateOne", () => {
		test("scopes an update to a conch", () => {
			const result = new CRUDFactory({
				tableName: "members",
				idColumnName: "member_id",
			}).generateUpdateOne({ first_name: "John" }, 123, 7);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"UPDATE members SET first_name = $1 " +
					"WHERE member_id = $2 AND conch_id = $3 RETURNING *",
				values: ["John", 123, 7],
			});
		});

		test("generates a parameterized update query for one column", () => {
			const result = crudFactory.generateUpdateOne({ first_name: "John" }, 123);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"UPDATE users SET first_name = $1 WHERE user_id = $2 RETURNING *",
				values: ["John", 123],
			});
		});

		test("generates placeholders in the same order as the provided values", () => {
			const result = crudFactory.generateUpdateOne(
				{
					first_name: "John",
					last_name: "Doe",
					email: "john@example.com",
				},
				123,
			);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"UPDATE users SET first_name = $1, last_name = $2, email = $3 " +
					"WHERE user_id = $4 RETURNING *",
				values: ["John", "Doe", "john@example.com", 123],
			});
		});

		test("supports values other than strings", () => {
			const result = crudFactory.generateUpdateOne(
				{
					age: 25,
					is_active: true,
					nickname: null,
				},
				123,
			);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"UPDATE users SET age = $1, is_active = $2, nickname = $3 " +
					"WHERE user_id = $4 RETURNING *",
				values: [25, true, null, 123],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = new CRUDFactory({
				tableName: "user accounts",
				idColumnName: "user id",
			}).generateUpdateOne(
				{
					"display name": "John",
				},
				123,
			);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					'UPDATE "user accounts" SET "display name" = $1 ' +
					'WHERE "user id" = $2 RETURNING *',
				values: ["John", 123],
			});
		});

		test("does not interpolate update values directly into the query", () => {
			const maliciousValue = "'; DROP TABLE users; --";

			const result = crudFactory.generateUpdateOne(
				{ first_name: maliciousValue },
				123,
			);

			expect(normalizeSql(result.query)).toBe(
				"UPDATE users SET first_name = $1 WHERE user_id = $2 RETURNING *",
			);
			expect(result.values).toEqual([maliciousValue, 123]);
			expect(result.query).not.toContain(maliciousValue);
		});

		test("throws when no columns are provided for updating", () => {
			expect(() => crudFactory.generateUpdateOne({}, 123)).toThrow(
				"No columns for updates were entered.",
			);
		});
	});

	describe("generateDeleteOne", () => {
		test("scopes deletion to a conch", () => {
			const result = new CRUDFactory({
				tableName: "members",
				idColumnName: "member_id",
			}).generateDeleteOne(123, 7);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"DELETE FROM members WHERE member_id = $1 AND conch_id = $2 RETURNING *",
				values: [123, 7],
			});
		});

		test("generates a parameterized delete query", () => {
			const result = crudFactory.generateDeleteOne(123);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query: "DELETE FROM users WHERE user_id = $1 RETURNING *",
				values: [123],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = new CRUDFactory({
				tableName: "user accounts",
				idColumnName: "user id",
			}).generateDeleteOne(123);

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query: 'DELETE FROM "user accounts" WHERE "user id" = $1 RETURNING *',
				values: [123],
			});
		});

		test("does not interpolate the id directly into the query", () => {
			const maliciousId = 999;

			const result = crudFactory.generateDeleteOne(maliciousId);

			expect(normalizeSql(result.query)).toBe(
				"DELETE FROM users WHERE user_id = $1 RETURNING *",
			);
			expect(result.values).toEqual([maliciousId]);
			expect(result.query).not.toContain(maliciousId);
		});
	});

	describe("generateCreateOne", () => {
		test("generates a parameterized insert query for one column", () => {
			const result = crudFactory.generateCreateOne({ first_name: "John" });

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query: "INSERT INTO users (first_name) VALUES ($1) RETURNING *",
				values: ["John"],
			});
		});

		test("generates columns and placeholders in matching order", () => {
			const result = crudFactory.generateCreateOne({
				first_name: "John",
				last_name: "Doe",
				email: "john@example.com",
			});

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"INSERT INTO users (first_name, last_name, email) " +
					"VALUES ($1, $2, $3) RETURNING *",
				values: ["John", "Doe", "john@example.com"],
			});
		});

		test("supports values other than strings", () => {
			const result = crudFactory.generateCreateOne({
				age: 25,
				is_active: true,
				nickname: null,
			});

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					"INSERT INTO users (age, is_active, nickname) " +
					"VALUES ($1, $2, $3) RETURNING *",
				values: [25, true, null],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = new CRUDFactory({
				tableName: "user accounts",
				idColumnName: "user_id",
			}).generateCreateOne({ "display name": "John" });

			expect({ ...result, query: normalizeSql(result.query) }).toEqual({
				query:
					'INSERT INTO "user accounts" ("display name") ' +
					"VALUES ($1) RETURNING *",
				values: ["John"],
			});
		});

		test("does not interpolate values directly into the query", () => {
			const maliciousValue = "'; DROP TABLE users; --";

			const result = crudFactory.generateCreateOne({
				first_name: maliciousValue,
			});

			expect(normalizeSql(result.query)).toBe(
				"INSERT INTO users (first_name) VALUES ($1) RETURNING *",
			);
			expect(result.values).toEqual([maliciousValue]);
			expect(result.query).not.toContain(maliciousValue);
		});

		test("throws when no columns are provided for creation", () => {
			expect(() => crudFactory.generateCreateOne({})).toThrow(
				"No columns for creation were entered.",
			);
		});
	});
});
