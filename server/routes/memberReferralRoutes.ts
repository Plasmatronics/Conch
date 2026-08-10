import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	memberReferralsTableName,
	memberReferralsIdColumnName,
	memberReferralsCreateSchema,
	memberReferralsUpdateSchema,
} from "../schemas";

export const createMemberReferralRoutes = (dbPool: Pool): Router => {
	const memberReferralRouteFactory = new RouteFactory(
		memberReferralsTableName,
		dbPool,
		memberReferralsIdColumnName,
		crudFactory,
		memberReferralsCreateSchema,
		memberReferralsUpdateSchema,
	);

	return memberReferralRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "member",
		patchRoute: "admin",
		deleteRoute: "admin",
	});
};
