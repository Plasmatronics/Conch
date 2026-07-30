import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { AWSSecretStore } from "./secrets";
import { ConchDBService } from "./db";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { loadEnvVariables } from "./utils";
import { Pool } from "pg";
import { ConchService } from "./types";
import { healthCheck } from "./utils/healthCheck";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface AppContext {
	dbPool: Pool;
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
	path: path.resolve(currentDirectory, "../config.env"),
});

const startServer = async (): Promise<AppContext> => {
	const {
		devPort,
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
	} = loadEnvVariables();

	const secretsClient = new SecretsManagerClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
	const awsSecretStore = new AWSSecretStore(secretsClient, { secretId });
	const dbPoolClient = new ConchDBService(
		{
			db,
			host,
			rdsPortStr,
			caCertPath,
			connectionTimeoutMillis: 5000,
		},
		awsSecretStore,
	);

	const vitalServices: ConchService[] = [awsSecretStore, dbPoolClient];
	const areVitalServicesHealthy = await healthCheck(vitalServices);
	const errors: string[] = [];
	for (const { isHealthy, message, service } of areVitalServicesHealthy) {
		if (isHealthy) continue;
		errors.push(message ?? `An unknown error occurred in ${service}`);
	}
	if (errors.length) throw new Error(errors.join("\n"));

	const dbPool = await dbPoolClient.initializePool();

	const app: Express = express();
	app.get("/health", async (_req: Request, res: Response) => {
		try {
			const healthChecks = await healthCheck([dbPoolClient]);
			const errors: string[] = [];
			for (const { isHealthy, message, service } of healthChecks) {
				if (isHealthy) continue;
				errors.push(message ?? `An unknown error occurred in ${service}`);
			}
			if (errors.length) throw new Error(errors.join("\n"));

			res.status(200).json({ status: "ok" });
		} catch (error: unknown) {
			res.status(503).json({
				status: `${error instanceof Error ? error.message : "Unknown error has occurred."}`,
			});
		}
	});

	const server = app.listen(devPort, () => {
		console.log(`Listening on port ${devPort}`);
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

	return { dbPool };
};

export const appContext = await startServer();
