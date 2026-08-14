/* eslint-disable @typescript-eslint/no-explicit-any */
//need to use any to bypass private properties and test/examine them

import fs from "fs";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { SecretStoreStrategy } from "../secrets";
import { ConchDBService } from "./ConchDBService";

vi.mock("fs", () => {
	return {
		default: {
			promises: {
				readFile: vi.fn(),
			},
		},
	};
});

const mockPool = {
	on: vi.fn(),
	query: vi.fn(),
	end: vi.fn(),
};

vi.mock("pg", () => {
	class MockPool {
		constructor() {
			return mockPool;
		}
	}

	return { Pool: MockPool };
});

const testConfig = {
	secretId: "test-secret-id",
	accessKeyId: "test-access-key",
	secretAccessKey: "test-secret-access-key",

	db: "test-db",
	host: "test-db-host",
	rdsPortStr: "5432",

	region: "us-east-1",
	caCertPath: "./test-ca.pem",
};

const mockSecretStore: SecretStoreStrategy = {
	getSecretUsernameAndPassword: vi.fn(),
	health: vi.fn(),
};

let dbService: ConchDBService;
beforeEach(() => {
	vi.clearAllMocks();

	vi.mocked(mockSecretStore.getSecretUsernameAndPassword).mockResolvedValue({
		username: "testUsername",
		password: "testPassword",
	});

	vi.mocked(fs.promises.readFile).mockResolvedValue(`
		-----BEGIN CERTIFICATE-----
		TEST
		-----END CERTIFICATE-----`);

	mockPool.on.mockReturnValue(mockPool);
	mockPool.query.mockResolvedValue({
		rows: [],
	});
	mockPool.end.mockResolvedValue(undefined);

	dbService = new ConchDBService(testConfig, mockSecretStore);
});

describe("Initialization processes", () => {
	describe("Initialization Successful Lifecycle", () => {
		test("openPromise goes null after we initializePool", async () => {
			await dbService.initializePool();
			expect((dbService as any).openPoolPromise).toBeNull();
		});

		test("Repeated initialization calls use the same pool instance", async () => {
			await dbService.initializePool();
			const firstCallPool = (dbService as any).pool;

			await dbService.initializePool();
			const secondCallPool = (dbService as any).pool;

			expect(firstCallPool).toBe(secondCallPool);
		});
	});

	describe("Initialization Failures ", () => {
		beforeEach(() => {
			vi.mocked(mockSecretStore.getSecretUsernameAndPassword).mockRejectedValue(
				new Error("Could not connect to secret store"),
			);
		});

		test("Upon intiailizaition failure, we generate expected failure", async () => {
			await expect(dbService.initializePool()).rejects.toThrow(
				"Error during pool creation: Could not connect to secret store",
			);
		});

		test("Upon intiailizaition failure, class pool open promise instance is properly freed", async () => {
			await expect(dbService.initializePool()).rejects.toThrow();
			expect((dbService as any).openPoolPromise).toBeNull();
		});

		test("failure for no caCert fails with expected error", async () => {
			vi.mocked(mockSecretStore.getSecretUsernameAndPassword).mockResolvedValue(
				{
					username: "testUsername",
					password: "testPassword",
				},
			);

			vi.mocked(fs.promises.readFile).mockResolvedValue("");

			await expect(dbService.initializePool()).rejects.toThrow(
				"Error during pool creation: Failed to initialize database pool: CA certificate is empty.",
			);
		});
	});
});

describe("Shutdown processes", () => {
	describe("successful shutdown", () => {
		beforeEach(async () => {
			await dbService.initializePool();
		});

		test("clears pool after successful closure", async () => {
			await dbService.releaseClientsAndClosePool();

			expect((dbService as any).pool).toBeNull();
			expect((dbService as any).closePoolPromise).toBeNull();
			expect(mockPool.end).toHaveBeenCalledOnce();
		});
	});

	describe("failed shutdown", () => {
		beforeEach(async () => {
			mockPool.end.mockRejectedValue(new Error("Could not reach AWS"));
			await dbService.initializePool();
		});

		test("Upon pool closure, class pool instance is properly freed", async () => {
			await expect(dbService.releaseClientsAndClosePool()).rejects.toThrow();
			expect((dbService as any).pool).toBeNull();
		});

		test("Upon pool closure failure, we generate expected error", async () => {
			await expect(dbService.releaseClientsAndClosePool()).rejects.toThrow(
				"An error occurred during pool closure: Could not reach AWS",
			);
		});

		test("Upon pool closure, class pool close promise instance is properly freed", async () => {
			await expect(dbService.releaseClientsAndClosePool()).rejects.toThrow();
			expect((dbService as any).closePoolPromise).toBeNull();
		});
	});
});

describe("Concurrency", () => {
	const createDeferredPromise = <T>() => {
		let resolve!: (value: T) => void;
		let reject!: (reason?: unknown) => void;

		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		return { promise, resolve, reject };
	};

	test("Concurrent open calls share the same pool", async () => {
		const secretDeferred = createDeferredPromise<{
			username: string;
			password: string;
		}>();
		vi.mocked(mockSecretStore.getSecretUsernameAndPassword).mockReturnValue(
			secretDeferred.promise,
		);

		const initOne = dbService.initializePool();
		const initTwo = dbService.initializePool();

		secretDeferred.resolve({
			username: "test-username",
			password: "test-password",
		});

		const [poolOne, poolTwo] = await Promise.all([initOne, initTwo]);
		expect(poolOne).toBe(poolTwo);
	});

	test("Concurrent close calls share the same close pool promise", async () => {
		await dbService.initializePool();
		const dbEndDeferreed = createDeferredPromise<void>();
		vi.mocked(mockPool.end).mockReturnValue(dbEndDeferreed.promise);

		const closeOne = dbService.releaseClientsAndClosePool();
		const closeTwo = dbService.releaseClientsAndClosePool();

		expect(mockPool.end).toHaveBeenCalledOnce();

		dbEndDeferreed.resolve();
		await Promise.all([closeOne, closeTwo]);
	});

	test("If a close is in progress an open pool call waits until it finishes closing", async () => {
		await dbService.initializePool();

		const dbEndDeferreed = createDeferredPromise<void>();
		vi.mocked(mockPool.end).mockReturnValue(dbEndDeferreed.promise);

		const close = dbService.releaseClientsAndClosePool();
		const open = dbService.initializePool();

		expect(mockPool.end).toHaveBeenCalledOnce();
		expect(mockSecretStore.getSecretUsernameAndPassword).toHaveBeenCalledOnce();

		dbEndDeferreed.resolve();
		await close;
		await open;

		expect(mockSecretStore.getSecretUsernameAndPassword).toHaveBeenCalledTimes(
			2,
		);

		await dbService.releaseClientsAndClosePool();
	});

	test("If a open is in progress a close pool call waits until it finishes opening", async () => {
		const initDeferred = createDeferredPromise<{
			username: string;
			password: string;
		}>();

		vi.mocked(mockSecretStore.getSecretUsernameAndPassword).mockReturnValue(
			initDeferred.promise,
		);

		const init = dbService.initializePool();
		const close = dbService.releaseClientsAndClosePool();

		expect(mockPool.end).toHaveBeenCalledTimes(0);

		initDeferred.resolve({
			username: "testUsername",
			password: "testPassword",
		});

		await init;
		await close;

		expect(mockPool.end).toHaveBeenCalledOnce();
	});
});

describe("Health checks", () => {
	test("Test Health Check Success matches shape we expect", async () => {
		expect(await dbService.health()).toEqual({
			service: (dbService as any).serviceName,
			isHealthy: true,
			requestTime: expect.any(Number),
			message: "All components operable",
		});
	});

	test("Test Health Check Failure matches shape we expect", async () => {
		mockPool.query.mockRejectedValue(new Error("Could not reach AWS"));

		expect(await dbService.health()).toEqual({
			service: (dbService as any).serviceName,
			isHealthy: false,
			requestTime: expect.any(Number),
			message: "Could not reach AWS",
		});
	});
});
