import { createConchDBService } from "../services";
import readline from "node:readline";
import { appEnvVariables } from "../appEnvVariables";
import { pathToFileURL } from "node:url";

export const nukeDb = async (): Promise<void> => {
	const errors: Error[] = [];

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

	try {
		const dbPool = await dbPoolClient.initializePool();
		await dbPool.query(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			GRANT ALL ON SCHEMA public TO CURRENT_USER;
			GRANT USAGE ON SCHEMA public TO PUBLIC;
		`);
	} catch (deletionError: unknown) {
		errors.push(
			new Error(`Failed to nuke the database`, {
				cause: deletionError,
			}),
		);
	} finally {
		try {
			await dbPoolClient.releaseClientsAndClosePool();
		} catch (closureError: unknown) {
			errors.push(
				new Error("An error occurred during pool closure", {
					cause: closureError,
				}),
			);
		}
	}

	if (errors.length === 1) {
		throw errors[0];
	} else if (errors.length > 1) {
		throw new AggregateError(
			errors,
			`Errors occurred during nuking and pool closure`,
		);
	}
};

const confirmNukeDb = async (): Promise<void> => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const askNukeDb = async () => {
		const res = await new Promise<string>((resolve, _rej) => {
			rl.question(
				`Are you sure you want to nuke the database? This will result in complete and total loss of all data.\n (Yes or No)`,
				resolve,
			);
		});

		const normalizedRes = res.toLowerCase();
		if (normalizedRes === "yes") await nukeDb();
		else if (normalizedRes !== "no") await askNukeDb();
	};

	try {
		await askNukeDb();
	} catch (err: unknown) {
		throw new Error(
			`An error occurred during db Deletion: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
			{ cause: err },
		);
	} finally {
		rl.close();
	}
};

const isDirectExecution =
	process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
	await confirmNukeDb();
}
