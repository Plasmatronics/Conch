import express, { type Express, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { ConchService } from "./types";
import { healthCheck, appEnvVariables } from "./utils";
import { createConchDBService } from "./db";
import {
	createClaimRoutes,
	createConchRoutes,
	createMediaRoutes,
	createMemberReferralRoutes,
	createMemberRoutes,
	createPostRoutes,
	createRelationshipRoutes,
	createUserReferralRoutes,
	createUserRoutes,
} from "./routes";

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
		apiPrefix,
		devPort,
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
	app.get(`${apiPrefix}/health`, async (_req: Request, res: Response) => {
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

	app.use(express.json());
	app.use(cookieParser());

	const claimRoutes = createClaimRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/claims`, claimRoutes);

	const conchRoutes = createConchRoutes(dbPool);
	app.use(`${apiPrefix}/conches`, conchRoutes);

	const mediaRoutes = createMediaRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/media`, mediaRoutes);

	const memberReferralRoutes = createMemberReferralRoutes(dbPool);
	app.use(
		`${apiPrefix}/conches/:conchId/memberReferrals`,
		memberReferralRoutes,
	);

	const memberRoutes = createMemberRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/members`, memberRoutes);

	const postRoutes = createPostRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/posts`, postRoutes);

	const relationshipRoutes = createRelationshipRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/relationships`, relationshipRoutes);

	const userReferralRoutes = createUserReferralRoutes(dbPool);
	app.use(`${apiPrefix}/conches/:conchId/userReferrals`, userReferralRoutes);

	const userRoutes = createUserRoutes(dbPool);
	app.use(`${apiPrefix}/users`, userRoutes);

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
