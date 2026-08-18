import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { createConchDBService } from "../services";
import type { ConchDBService } from "../services";
import { nukeDb } from "./nuke-db";
import { mockPool } from "../vitest.setup";

vi.mock("../services", () => ({
	createConchDBService: vi.fn(),
}));

const mockCreateConchDBService = vi.mocked(createConchDBService);

const mockDBService = {
	health: vi.fn(),
	initializePool: vi.fn(),
	releaseClientsAndClosePool: vi.fn(),
};

const nukeQuery = `
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			GRANT ALL ON SCHEMA public TO CURRENT_USER;
			GRANT USAGE ON SCHEMA public TO PUBLIC;
		`;

beforeEach(() => {
	vi.clearAllMocks();

	mockCreateConchDBService.mockReturnValue(
		mockDBService as unknown as ConchDBService,
	);

	mockDBService.initializePool.mockResolvedValue(mockPool);
	mockDBService.releaseClientsAndClosePool.mockResolvedValue(undefined);

	mockPool.query.mockResolvedValue({});
});

const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

afterAll(() => {
	consoleLogSpy.mockRestore();
});

describe("nukeDb", () => {
	describe("successful deletion", () => {
		test("creates the database service", async () => {
			await nukeDb();

			expect(mockCreateConchDBService).toHaveBeenCalledOnce();
		});

		test("initializes the database pool", async () => {
			await nukeDb();

			expect(mockDBService.initializePool).toHaveBeenCalledOnce();
		});

		test("drops and recreates an empty public schema", async () => {
			await nukeDb();

			expect(mockPool.query).toHaveBeenCalledOnce();
			expect(mockPool.query).toHaveBeenCalledWith(nukeQuery);
		});

		test("closes the pool after successful deletion", async () => {
			await nukeDb();

			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});
	});

	describe("database failures", () => {
		test("throws when pool initialization fails", async () => {
			mockDBService.initializePool.mockRejectedValue(
				new Error("pool initialization failed"),
			);

			await expect(nukeDb()).rejects.toThrow("Failed to nuke the database");

			expect(mockPool.query).not.toHaveBeenCalled();
		});

		test("still attempts pool cleanup when initialization fails", async () => {
			mockDBService.initializePool.mockRejectedValue(
				new Error("pool initialization failed"),
			);

			await expect(nukeDb()).rejects.toThrow();

			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});

		test("throws when the schema deletion query fails", async () => {
			mockPool.query.mockRejectedValue(new Error("database query failed"));

			await expect(nukeDb()).rejects.toThrow("Failed to nuke the database");

			expect(mockPool.query).toHaveBeenCalledWith(nukeQuery);
		});

		test("still attempts pool cleanup when the deletion query fails", async () => {
			mockPool.query.mockRejectedValue(new Error("database query failed"));

			await expect(nukeDb()).rejects.toThrow();

			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});
	});

	describe("cleanup failures", () => {
		test("throws when pool closure fails after successful deletion", async () => {
			mockDBService.releaseClientsAndClosePool.mockRejectedValue(
				new Error("pool closure failed"),
			);

			await expect(nukeDb()).rejects.toThrow(
				"An error occurred during pool closure",
			);

			expect(mockPool.query).toHaveBeenCalledWith(nukeQuery);
		});

		test("throws AggregateError when deletion and pool closure both fail", async () => {
			mockPool.query.mockRejectedValue(new Error("database query failed"));

			mockDBService.releaseClientsAndClosePool.mockRejectedValue(
				new Error("pool closure failed"),
			);

			const error = await nukeDb().catch((error: unknown) => error);

			expect(error).toBeInstanceOf(AggregateError);

			const aggregateError = error as AggregateError;

			expect(aggregateError.errors).toHaveLength(2);
			expect(aggregateError.message).toBe(
				"Errors occurred during nuking and pool closure",
			);
		});

		test("preserves both the deletion and closure errors in the AggregateError", async () => {
			const deletionError = new Error("database query failed");
			const closureError = new Error("pool closure failed");

			mockPool.query.mockRejectedValue(deletionError);
			mockDBService.releaseClientsAndClosePool.mockRejectedValue(closureError);

			const error = await nukeDb().catch((error: unknown) => error);

			expect(error).toBeInstanceOf(AggregateError);

			const aggregateError = error as AggregateError;

			expect(aggregateError.errors[0]).toMatchObject({
				message: "Failed to nuke the database",
				cause: deletionError,
			});

			expect(aggregateError.errors[1]).toMatchObject({
				message: "An error occurred during pool closure",
				cause: closureError,
			});
		});
	});
});
