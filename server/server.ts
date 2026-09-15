import express, { type Express } from "express";
import { ConchService } from "./types";
import { appEnvVariables } from "./appEnvVariables";
import { createConchDBService, runStartupHealthCheck } from "./services";
import { mountApp } from "./app";
import { ConchFamilyCache } from "./cache";
import { LRUCacheWithDelete } from "mnemonist";
import { AllFamilyRelations, ConchFamilyGraphFactory } from "./domain";

const startServer = async (): Promise<void> => {
	const {
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
		devPort,
		conchFamilyCacheCapacity,
	} = appEnvVariables;

	const dbPoolClient = createConchDBService({
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
		connectionTimeoutMillis: 5000,
	});

	const dbPool = await dbPoolClient.initializePool();

	const lruCache = new LRUCacheWithDelete<number, AllFamilyRelations>(
		Number(conchFamilyCacheCapacity),
	);
	const conchFamilyGraphFactory = new ConchFamilyGraphFactory();
	const conchFamilyCache = new ConchFamilyCache(
		dbPool,
		conchFamilyGraphFactory,
		lruCache,
	);

	const vitalServices: ConchService[] = [dbPoolClient];
	await runStartupHealthCheck(vitalServices);

	const app: Express = express();
	mountApp(app, dbPool, vitalServices, conchFamilyCache);

	const server = app.listen(devPort ?? 4000, () => {
		console.log(`Listening on port ${devPort ?? 4000}`);
	});

	const shutdown = async () => {
		try {
			await dbPoolClient.releaseClientsAndClosePool();
			await new Promise<void>((resolve, reject) => {
				server.close((err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		} finally {
			process.exit(0);
		}
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
};

await startServer();
