import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { createConchDBService } from "../services";
import type { ConchDBService } from "../services";
import { determineTopologicalOrderingOfTableCreation } from "./utils";
import { enumCreationQueries, nodeToCreationQueryMap } from "../schemas";
import { injectTablesIntoDB } from "./init-db";
import { mockPool, mockPoolClient } from "../vitest.setup";

vi.mock("../services", () => ({
	createConchDBService: vi.fn(),
}));
const mockCreateConchDBService = vi.mocked(createConchDBService);

vi.mock("./utils", () => ({
	determineTopologicalOrderingOfTableCreation: vi.fn(),
}));
const mockDetermineTopologicalOrdering = vi.mocked(
	determineTopologicalOrderingOfTableCreation,
);

vi.mock("../schemas", () => ({
	enumCreationQueries: [
		"CREATE TYPE user_role AS ENUM ('admin', 'user');",
		"CREATE TYPE post_status AS ENUM ('draft', 'published');",
	],
	nodeToCreationQueryMap: {
		users: `
			CREATE TABLE users (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				role user_role NOT NULL
			);
		`,
		posts: `
			CREATE TABLE posts (
				id SERIAL PRIMARY KEY,
				user_id INTEGER NOT NULL REFERENCES users(id),
				title TEXT NOT NULL,
				status post_status NOT NULL
			);
		`,
	},
}));

const mockDBService = {
	health: vi.fn(),
	initializePool: vi.fn(),
	releaseClientsAndClosePool: vi.fn(),
};

beforeEach(() => {
	vi.clearAllMocks();

	mockDetermineTopologicalOrdering.mockReturnValue(["users", "posts"]);
	mockCreateConchDBService.mockReturnValue(
		mockDBService as unknown as ConchDBService,
	);
	mockDBService.initializePool.mockResolvedValue(mockPool);
	mockDBService.releaseClientsAndClosePool.mockResolvedValue(undefined);
	mockPool.connect.mockResolvedValue(mockPoolClient);
	mockPoolClient.query.mockResolvedValue({});
	mockPoolClient.release.mockImplementation(() => undefined);
});

const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

afterAll(() => {
	consoleLogSpy.mockRestore();
});

describe("injectTablesIntoDB", () => {
	describe("successful injection", () => {
		test("initializes the pool and obtains a client", async () => {
			await injectTablesIntoDB();

			expect(mockCreateConchDBService).toHaveBeenCalledOnce();
			expect(mockDBService.initializePool).toHaveBeenCalledOnce();
			expect(mockPool.connect).toHaveBeenCalledOnce();
		});

		test("begins a transaction before creating enums and tables", async () => {
			await injectTablesIntoDB();

			expect(mockPoolClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
		});

		test("creates enums before creating tables", async () => {
			await injectTablesIntoDB();

			const queries = mockPoolClient.query.mock.calls.map(([query]) => query);

			expect(queries).toEqual([
				"BEGIN",
				...enumCreationQueries,
				nodeToCreationQueryMap.users,
				nodeToCreationQueryMap.posts,
				"COMMIT",
			]);
		});

		test("creates tables according to their topological ordering", async () => {
			mockDetermineTopologicalOrdering.mockReturnValue(["posts", "users"]);

			await injectTablesIntoDB();

			const queries = mockPoolClient.query.mock.calls.map(([query]) => query);

			expect(queries).toEqual([
				"BEGIN",
				...enumCreationQueries,
				nodeToCreationQueryMap.posts,
				nodeToCreationQueryMap.users,
				"COMMIT",
			]);
		});

		test("commits after all creation queries succeed", async () => {
			await injectTablesIntoDB();

			expect(mockPoolClient.query).toHaveBeenLastCalledWith("COMMIT");
		});

		test("releases the client after successful injection", async () => {
			await injectTablesIntoDB();

			expect(mockPoolClient.release).toHaveBeenCalledOnce();
		});

		test("closes the pool after successful injection", async () => {
			await injectTablesIntoDB();

			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});
	});

	describe("configuration errors", () => {
		beforeEach(() => {
			mockDetermineTopologicalOrdering.mockReturnValue([]);
		});

		test("throws when no tables are configured", async () => {
			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during table injection",
			);

			expect(mockDBService.initializePool).not.toHaveBeenCalled();
		});

		test("still attempts pool cleanup when no tables are configured", async () => {
			await expect(injectTablesIntoDB()).rejects.toThrow();

			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});
	});

	describe("transaction failures", () => {
		test("rollback occcurs when enum creation fails", async () => {
			mockPoolClient.query.mockImplementation(async (query: string) => {
				if (query === enumCreationQueries[0]) {
					throw new Error("db connection severed");
				}

				return {};
			});

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during table injection",
			);

			expect(mockPoolClient.query).toHaveBeenCalledWith("ROLLBACK");
			expect(mockPoolClient.query).not.toHaveBeenCalledWith("COMMIT");
		});

		test("rollback occcurs when table creation fails", async () => {
			mockPoolClient.query.mockImplementation(async (query: string) => {
				if (query === nodeToCreationQueryMap.users) {
					throw new Error("db connection severed");
				}

				return {};
			});

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during table injection",
			);

			expect(mockPoolClient.query).toHaveBeenCalledWith("ROLLBACK");
			expect(mockPoolClient.query).not.toHaveBeenCalledWith("COMMIT");
		});

		test("rollback occurs when COMMIT fails", async () => {
			mockPoolClient.query.mockImplementation(async (query: string) => {
				if (query === "COMMIT") {
					throw new Error("db connection severed");
				}

				return {};
			});

			await expect(injectTablesIntoDB()).rejects.toThrow();

			expect(mockPoolClient.query).toHaveBeenCalledWith("ROLLBACK");
		});

		test("throws AggregateError when injection and rollback both fail", async () => {
			mockPoolClient.query.mockImplementation(async (query: string) => {
				if (query === nodeToCreationQueryMap.users) {
					throw new Error("db connection severed");
				}

				if (query === "ROLLBACK") {
					throw new Error("could not connect to the db");
				}
			});

			const error = await injectTablesIntoDB().catch((error: unknown) => error);

			expect(error).toBeInstanceOf(AggregateError);

			const aggregateError = error as AggregateError;

			expect(aggregateError.errors).toHaveLength(2);
			expect(aggregateError.message).toBe(
				"Multiple errors occurred during table injection process",
			);
		});
	});

	describe("pool and connection failures", () => {
		test("throws when pool initialization fails", async () => {
			mockDBService.initializePool.mockRejectedValue(
				new Error("pool initialization failed"),
			);

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during table injection",
			);

			expect(mockPoolClient.release).not.toHaveBeenCalled();
		});

		test("throws when obtaining a client fails", async () => {
			mockPool.connect.mockRejectedValue(new Error("connection failed"));

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during table injection",
			);

			expect(mockPoolClient.release).not.toHaveBeenCalled();
			expect(mockDBService.releaseClientsAndClosePool).toHaveBeenCalledOnce();
		});
	});

	describe("cleanup failures", () => {
		test("throws when client release fails after successful injection", async () => {
			mockPoolClient.release.mockThrow(new Error("client release failed"));

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during client release",
			);

			expect(mockPoolClient.query).toHaveBeenCalledWith("COMMIT");
		});

		test("throws when pool closure fails after successful injection", async () => {
			mockDBService.releaseClientsAndClosePool.mockRejectedValue(
				new Error("pool closure failed"),
			);

			await expect(injectTablesIntoDB()).rejects.toThrow(
				"An error occurred during pool closure",
			);

			expect(mockPoolClient.query).toHaveBeenCalledWith("COMMIT");
		});

		test("throws AggregateError when client release and pool closure both fail", async () => {
			mockPoolClient.release.mockImplementation(() => {
				throw new Error("client release failed");
			});

			mockDBService.releaseClientsAndClosePool.mockRejectedValue(
				new Error("pool closure failed"),
			);

			const error = await injectTablesIntoDB().catch((error: unknown) => error);

			expect(error).toBeInstanceOf(AggregateError);

			const aggregateError = error as AggregateError;

			expect(aggregateError.errors).toHaveLength(2);
			expect(aggregateError.message).toBe(
				"Table injection succeeded, but multiple cleanup errors occurred",
			);
		});

		test("collects injection, rollback, release, and pool closure errors", async () => {
			mockPoolClient.query.mockImplementation(async (query: string) => {
				if (query === nodeToCreationQueryMap.users) {
					throw new Error("creation failed");
				}

				if (query === "ROLLBACK") {
					throw new Error("rollback failed");
				}
			});

			mockPoolClient.release.mockImplementation(() => {
				throw new Error("release failed");
			});

			mockDBService.releaseClientsAndClosePool.mockRejectedValue(
				new Error("pool closure failed"),
			);

			const error = await injectTablesIntoDB().catch((error: unknown) => error);

			expect(error).toBeInstanceOf(AggregateError);

			const aggregateError = error as AggregateError;

			expect(aggregateError.errors).toHaveLength(4);
			expect(aggregateError.message).toBe(
				"Multiple errors occurred during table injection process",
			);
		});
	});
});
