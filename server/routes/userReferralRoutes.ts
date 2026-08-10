import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "../queries";
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

	return userReferralRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "member",
		patchRoute: "admin",
		deleteRoute: "admin",
	});
};
