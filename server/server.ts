import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { AWSSecretStore, ConchDBClient } from "./index";
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

	const dbClient = new ConchDBClient(
		{
			db,
			host,
			rdsPortStr,
			region,
			caCertPath,
		},
		awsSecretStore,
	);

	const _client = await dbClient.getClient();
	const app: Express = express();

	app.get("/health", (_req: Request, res: Response) => {
		res.status(200).json({ status: "ok" });
	});

	const server = app.listen(devPort, () => {
		console.log(`Listening on port ${devPort}`);
	});

	const shutdown = async () => {
		server.close();
		await dbClient.releaseClientsAndClosePool();
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
};
startServer();
