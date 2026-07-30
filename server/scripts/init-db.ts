import { enumCreationQueries, nodeToCreationQueryMap } from "../schemas";
import type { PoolClient } from "pg";
import { determineTopologicalOrderingOfTableCreation } from "./utils";
import type { RecordedError } from "../types";
import { createConchDBService } from "../db";

const injectTablesIntoDB = async (): Promise<void> => {
	const dbPoolClient = createConchDBService();

	let client: PoolClient | null = null;
	let transactionInitialized = false;
	let transactionCommitted = false;
	const errors: Array<RecordedError> = [];
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
		errors.push({
			cause: originalError,
			message: "An error occurred during table injection",
		});
		try {
			if (client && transactionInitialized) await client.query("ROLLBACK");
			transactionInitialized = false;
		} catch (rollbackError: unknown) {
			errors.push({
				cause: rollbackError,
				message: "An error occurred during transaction rollback",
			});
		}
	} finally {
		if (client) {
			try {
				client.release();
			} catch (releaseError: unknown) {
				errors.push({
					cause: releaseError,
					message: "An error occurred during client release",
				});
			}
		}

		try {
			await dbPoolClient.releaseClientsAndClosePool();
		} catch (poolClosureError: unknown) {
			errors.push({
				cause: poolClosureError,
				message: "An error occurred during pool closure",
			});
		}

		if (errors.length === 1) {
			const firstError = errors[0];
			throw new Error(firstError.message, {
				cause: firstError.cause,
			});
		} else if (errors.length > 1) {
			throw new AggregateError(
				errors.map(({ cause, message }) => new Error(message, { cause })),
				transactionCommitted
					? "Table injection succeeded, but multiple cleanup errors occurred"
					: "Multiple errors occurred during table injection process",
			);
		}
	}
};

await injectTablesIntoDB();
