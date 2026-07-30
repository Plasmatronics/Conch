import { createConchDBService } from "../db";
import readline from "node:readline";
import { RecordedError } from "../types";

const nukeDb = async (): Promise<void> => {
	const errors: RecordedError[] = [];
	const dbPoolClient = createConchDBService();
	try {
		const dbPool = await dbPoolClient.initializePool();
		await dbPool.query(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			GRANT ALL ON SCHEMA public TO CURRENT_USER;
			GRANT USAGE ON SCHEMA public TO PUBLIC;
		`);
	} catch (deletionError: unknown) {
		errors.push({
			cause: deletionError,
			message: `Failed to nuke the database`,
		});
	} finally {
		try {
			await dbPoolClient.releaseClientsAndClosePool();
		} catch (closureError: unknown) {
			errors.push({
				cause: closureError,
				message: "An error occurred during pool closure",
			});
		}
		if (errors.length === 1) {
			const error = errors[0];
			throw new Error(error.message, {
				cause: error.cause,
			});
		} else if (errors.length > 1) {
			throw new AggregateError(
				errors.map((err) => {
					return new Error(err.message, {
						cause: err.cause,
					});
				}),
				`Errors occurred during nuking and pool closure`,
			);
		}
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

await confirmNukeDb();
