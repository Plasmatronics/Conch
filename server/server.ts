import express, { type Express, type Request, type Response } from "express";
import { Pool } from "pg";
import { ConchService } from "./types";
import { healthCheck } from "./utils/healthCheck";
import { createConchDBService } from "./db";

interface AppContext {
	dbPool: Pool;
}

const startServer = async (): Promise<AppContext> => {
	console.log("hi from inside");
	const dbPoolClient = createConchDBService({ connectionTimeoutMillis: 5000 });

	const vitalServices: ConchService[] = [dbPoolClient];
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

	const server = app.listen(process.env.DEV_PORT ?? 4000, () => {
		console.log(`Listening on port ${process.env.DEV_PORT ?? 4000}`);
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
