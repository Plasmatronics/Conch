import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	userReferralsTableName,
	userReferralsIdColumnName,
	userReferralsCreateSchema,
	userReferralsUpdateSchema,
} from "../schemas";

export const createUserReferralRoutes = (dbPool: Pool): Router => {
	const userReferralRouteFactory = new RouteFactory(
		userReferralsTableName,
		dbPool,
		userReferralsIdColumnName,
		crudFactory,
		userReferralsCreateSchema,
		userReferralsUpdateSchema,
	);

	return userReferralRouteFactory.createRoutes();
};
