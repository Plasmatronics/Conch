import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { AWSSecretStore, ConchDBPoolClient } from "./index";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { loadEnvVariables } from "./utils";

dotenv.config({ path: "../config.env" });

const startServer = async (): Promise<void> => {
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

	const dbPool = new ConchDBPoolClient(
		{
			db,
			host,
			rdsPortStr,
			region,
			caCertPath,
		},
		awsSecretStore,
	);

	const app: Express = express();

	app.get("/health", async (_req: Request, res: Response) => {
		const dbClient = await dbPool.getClient();

		try {
			await dbClient.query(`SELECT 1`);
			res.status(200).json({ status: "ok" });
		} catch (error: unknown) {
			res.status(503).json({
				status: `${error instanceof Error ? error.message : "Unknown error has occurred."}`,
			});
		} finally {
			dbPool.releaseClient(dbClient);
		}
	});

	const server = app.listen(devPort, () => {
		console.log(`Listening on port ${devPort}`);
	});

	const shutdown = async () => {
		try {
			await dbPool.releaseClientsAndClosePool();
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
startServer();
