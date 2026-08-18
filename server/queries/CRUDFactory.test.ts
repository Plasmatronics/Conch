import { describe, expect, test } from "vitest";
import { crudFactory } from "./CRUDFactory";

describe("crudFactory", () => {
	describe("generateGetAll", () => {
		test("generates a query to retrieve all rows from a table", () => {
			const result = crudFactory.generateGetAll("users");

			expect(result).toEqual({
				text: "SELECT * FROM users",
				values: [],
			});
		});

		test("escapes the table identifier", () => {
			const result = crudFactory.generateGetAll("user accounts");

			expect(result).toEqual({
				text: 'SELECT * FROM "user accounts"',
				values: [],
			});
		});
	});

	describe("generateGetOne", () => {
		test("generates a parameterized query to retrieve one row", () => {
			const result = crudFactory.generateGetOne("users", "user_id", "123");

			expect(result).toEqual({
				text: "SELECT * FROM users WHERE user_id = $1",
				values: ["123"],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = crudFactory.generateGetOne(
				"user accounts",
				"user id",
				"123",
			);

			expect(result).toEqual({
				text: 'SELECT * FROM "user accounts" WHERE "user id" = $1',
				values: ["123"],
			});
		});

		test("does not interpolate the id directly into the query", () => {
			const maliciousId = "'; DROP TABLE users; --";

			const result = crudFactory.generateGetOne(
				"users",
				"user_id",
				maliciousId,
			);

			expect(result.text).toBe("SELECT * FROM users WHERE user_id = $1");
			expect(result.values).toEqual([maliciousId]);
			expect(result.text).not.toContain(maliciousId);
		});
	});

	describe("generateUpdateOne", () => {
		test("generates a parameterized update query for one column", () => {
			const result = crudFactory.generateUpdateOne(
				"users",
				{
					first_name: "John",
				},
				"user_id",
				"123",
			);

			expect(result).toEqual({
				text: "UPDATE users SET first_name = $1 WHERE user_id = $2 RETURNING *",
				values: ["John", "123"],
			});
		});

		test("generates placeholders in the same order as the provided values", () => {
			const result = crudFactory.generateUpdateOne(
				"users",
				{
					first_name: "John",
					last_name: "Doe",
					email: "john@example.com",
				},
				"user_id",
				"123",
			);

			expect(result).toEqual({
				text:
					"UPDATE users SET first_name = $1, last_name = $2, email = $3 " +
					"WHERE user_id = $4 RETURNING *",
				values: ["John", "Doe", "john@example.com", "123"],
			});
		});

		test("supports values other than strings", () => {
			const result = crudFactory.generateUpdateOne(
				"users",
				{
					age: 25,
					is_active: true,
					nickname: null,
				},
				"user_id",
				"123",
			);

			expect(result).toEqual({
				text:
					"UPDATE users SET age = $1, is_active = $2, nickname = $3 " +
					"WHERE user_id = $4 RETURNING *",
				values: [25, true, null, "123"],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = crudFactory.generateUpdateOne(
				"user accounts",
				{
					"display name": "John",
				},
				"user id",
				"123",
			);

			expect(result).toEqual({
				text:
					'UPDATE "user accounts" SET "display name" = $1 ' +
					'WHERE "user id" = $2 RETURNING *',
				values: ["John", "123"],
			});
		});

		test("does not interpolate update values directly into the query", () => {
			const maliciousValue = "'; DROP TABLE users; --";

			const result = crudFactory.generateUpdateOne(
				"users",
				{
					first_name: maliciousValue,
				},
				"user_id",
				"123",
			);

			expect(result.text).toBe(
				"UPDATE users SET first_name = $1 WHERE user_id = $2 RETURNING *",
			);
			expect(result.values).toEqual([maliciousValue, "123"]);
			expect(result.text).not.toContain(maliciousValue);
		});

		test("throws when no columns are provided for updating", () => {
			expect(() =>
				crudFactory.generateUpdateOne("users", {}, "user_id", "123"),
			).toThrow("No columns for updates were entered.");
		});
	});

	describe("generateDeleteOne", () => {
		test("generates a parameterized delete query", () => {
			const result = crudFactory.generateDeleteOne("users", "user_id", "123");

			expect(result).toEqual({
				text: "DELETE FROM users WHERE user_id = $1 RETURNING *",
				values: ["123"],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = crudFactory.generateDeleteOne(
				"user accounts",
				"user id",
				"123",
			);

			expect(result).toEqual({
				text: 'DELETE FROM "user accounts" WHERE "user id" = $1 RETURNING *',
				values: ["123"],
			});
		});

		test("does not interpolate the id directly into the query", () => {
			const maliciousId = "'; DROP TABLE users; --";

			const result = crudFactory.generateDeleteOne(
				"users",
				"user_id",
				maliciousId,
			);

			expect(result.text).toBe(
				"DELETE FROM users WHERE user_id = $1 RETURNING *",
			);
			expect(result.values).toEqual([maliciousId]);
			expect(result.text).not.toContain(maliciousId);
		});
	});

	describe("generateCreateOne", () => {
		test("generates a parameterized insert query for one column", () => {
			const result = crudFactory.generateCreateOne("users", {
				first_name: "John",
			});

			expect(result).toEqual({
				text: "INSERT INTO users (first_name) VALUES ($1) RETURNING *",
				values: ["John"],
			});
		});

		test("generates columns and placeholders in matching order", () => {
			const result = crudFactory.generateCreateOne("users", {
				first_name: "John",
				last_name: "Doe",
				email: "john@example.com",
			});

			expect(result).toEqual({
				text:
					"INSERT INTO users (first_name, last_name, email) " +
					"VALUES ($1, $2, $3) RETURNING *",
				values: ["John", "Doe", "john@example.com"],
			});
		});

		test("supports values other than strings", () => {
			const result = crudFactory.generateCreateOne("users", {
				age: 25,
				is_active: true,
				nickname: null,
			});

			expect(result).toEqual({
				text:
					"INSERT INTO users (age, is_active, nickname) " +
					"VALUES ($1, $2, $3) RETURNING *",
				values: [25, true, null],
			});
		});

		test("escapes table and column identifiers", () => {
			const result = crudFactory.generateCreateOne("user accounts", {
				"display name": "John",
			});

			expect(result).toEqual({
				text:
					'INSERT INTO "user accounts" ("display name") ' +
					"VALUES ($1) RETURNING *",
				values: ["John"],
			});
		});

		test("does not interpolate values directly into the query", () => {
			const maliciousValue = "'; DROP TABLE users; --";

			const result = crudFactory.generateCreateOne("users", {
				first_name: maliciousValue,
			});

			expect(result.text).toBe(
				"INSERT INTO users (first_name) VALUES ($1) RETURNING *",
			);
			expect(result.values).toEqual([maliciousValue]);
			expect(result.text).not.toContain(maliciousValue);
		});

		test("throws when no columns are provided for creation", () => {
			expect(() => crudFactory.generateCreateOne("users", {})).toThrow(
				"No columns for creation were entered.",
			);
		});
	});
});
