import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import { Pool } from "pg";
import {
	createAuthRoutes,
	createClaimRoutes,
	createConchRoutes,
	createHealthRoutes,
	createMediaRoutes,
	createMemberReferralRoutes,
	createMemberRoutes,
	createPostRoutes,
	createRelationshipRoutes,
	createUserReferralRoutes,
	createUserRoutes,
} from "./routes";
import { ConchService } from "./types";
import { appEnvVariables } from "./appEnvVariables";

export const mountApp = (
	app: Express,
	dbPool: Pool,
	vitalServices: ConchService[],
) => {
	const { apiPrefix } = appEnvVariables;
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

	const authRoutes = createAuthRoutes(dbPool);
	app.use(`${apiPrefix}`, authRoutes);

	const healthRoutes = createHealthRoutes(vitalServices);
	app.use(`${apiPrefix}/health`, healthRoutes);
};
