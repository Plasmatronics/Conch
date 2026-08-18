import { enumCreationQueries, nodeToCreationQueryMap } from "../schemas";
import type { PoolClient } from "pg";
import { determineTopologicalOrderingOfTableCreation } from "./utils";
import { createConchDBService } from "../services";
import { appEnvVariables } from "../appEnvVariables";
import { pathToFileURL } from "node:url";

export const injectTablesIntoDB = async (): Promise<void> => {
	const {
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
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

	let client: PoolClient | null = null;
	let transactionInitialized = false;
	let transactionCommitted = false;
	const errors: Array<Error> = [];
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
		transactionCommitted = true;
		console.log(
			`The following tables were added to the db:\n ${creationOrder.join("\n")}`,
		);
	} catch (originalError: unknown) {
		errors.push(
			new Error("An error occurred during table injection", {
				cause: originalError,
			}),
		);
		try {
			if (client && transactionInitialized) await client.query("ROLLBACK");
			transactionInitialized = false;
		} catch (rollbackError: unknown) {
			errors.push(
				new Error("An error occurred during transaction rollback", {
					cause: rollbackError,
				}),
			);
		}
	} finally {
		if (client) {
			try {
				client.release();
			} catch (releaseError: unknown) {
				errors.push(
					new Error("An error occurred during client release", {
						cause: releaseError,
					}),
				);
			}
		}

		try {
			await dbPoolClient.releaseClientsAndClosePool();
		} catch (poolClosureError: unknown) {
			errors.push(
				new Error("An error occurred during pool closure", {
					cause: poolClosureError,
				}),
			);
		}
	}

	if (errors.length === 1) {
		throw errors[0];
	} else if (errors.length > 1) {
		throw new AggregateError(
			errors,
			transactionCommitted
				? "Table injection succeeded, but multiple cleanup errors occurred"
				: "Multiple errors occurred during table injection process",
		);
	}
};

const isDirectExecution =
	process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
	await injectTablesIntoDB();
}
