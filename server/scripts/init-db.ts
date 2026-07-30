import { enumCreationQueries, nodeToCreationQueryMap } from "../schemas";
import dotenv from "dotenv";
import { AWSSecretStore } from "../secrets";
import { ConchDBService } from "../db";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { loadEnvVariables } from "../utils";
import type { PoolClient } from "pg";
import { determineTopologicalOrderingOfTableCreation } from "./utils";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
	path: path.resolve(currentDirectory, "../../config.env"),
});

const injectTablesIntoDB = async (): Promise<void> => {
	const {
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

	let client: PoolClient | null = null;
	let transactionInitialized = false;
	let error: unknown = null;
	try {
		const creationOrder = determineTopologicalOrderingOfTableCreation();
		if (!creationOrder.length)
			throw new Error("No tables are configured for addition");

		const dbPool = await dbPoolClient.initializePool();
		client = await dbPool.connect();

		await client.query("BEGIN");
		transactionInitialized = true;
		for (const query of enumCreationQueries) {
			await client.query(query);
		}
		for (const tableName of creationOrder) {
			await client.query(nodeToCreationQueryMap[tableName]);
		}

		await client.query("COMMIT");
		transactionInitialized = false;
		console.log(
			`The following tables were added to the db:\n ${creationOrder.join("\n")}`,
		);
	} catch (originalError: unknown) {
		error = originalError;
		try {
			if (client && transactionInitialized) await client.query("ROLLBACK");
		} catch (rollbackError: unknown) {
			throw new AggregateError(
				[originalError, rollbackError],
				"Table injection failed and rollback also failed",
			);
		}

		throw new Error("An error occurred during table injection", {
			cause: originalError,
		});
	} finally {
		const cleanupErrors: unknown[] = [];

		if (client) {
			try {
				client.release();
			} catch (releaseError: unknown) {
				cleanupErrors.push(releaseError);
			}
		}

		try {
			await dbPoolClient.releaseClientsAndClosePool();
		} catch (poolClosureError: unknown) {
			cleanupErrors.push(poolClosureError);
		}

		if (error && cleanupErrors.length) {
			throw new AggregateError(
				[error, ...cleanupErrors],
				"Table injection failed and cleanup also failed",
			);
		}

		if (error) {
			throw new Error("An error occurred during table injection", {
				cause: error,
			});
		}

		if (cleanupErrors.length === 1) {
			throw new Error("An error occurred during database cleanup", {
				cause: cleanupErrors[0],
			});
		}

		if (cleanupErrors.length > 1) {
			throw new AggregateError(
				cleanupErrors,
				"Multiple errors occurred during database cleanup",
			);
		}
	}
};

await injectTablesIntoDB();
