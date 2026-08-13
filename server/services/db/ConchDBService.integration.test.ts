import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createConchDBService } from "./createConchDBService";
import type { ConchDBService } from "./ConchDBService";
import { appEnvVariables } from "../../utils";

describe("Real database integration", () => {
	let dbService: ConchDBService;

	beforeAll(() => {
		const {
			secretId,
			accessKeyId,
			secretAccessKey,
			region,
			db,
			host,
			rdsPortStr,
			caCertPath,
		} = appEnvVariables;

		dbService = createConchDBService({
			secretId,
			accessKeyId,
			secretAccessKey,
			region,

			db,
			host,
			rdsPortStr,
			caCertPath,
		});
	});

	afterAll(async () => {
		await dbService.releaseClientsAndClosePool();
	});

	test("real db initialization operates as expected", async () => {
		const pool = await dbService.initializePool();
		expect(pool).toBeDefined();

		const result = await pool.query("SELECT 1 AS value");
		expect(result.rowCount).toBeGreaterThan(0);
	});

	test("real db health operates as expected", async () => {
		const health = await dbService.health();

		expect(health).toEqual({
			service: (dbService as any).serviceName,
			isHealthy: true,
			requestTime: expect.any(Number),
			message: "All components operable",
		});
	});

	test("real db closing operates as expected", async () => {
		await dbService.initializePool();

		await expect(
			dbService.releaseClientsAndClosePool(),
		).resolves.toBeUndefined();

		expect((dbService as any).pool).toBeNull();
		expect((dbService as any).closePoolPromise).toBeNull();
	});
});
