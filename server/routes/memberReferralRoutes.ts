import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { CRUDFactory } from "../queries";
import {
	memberReferralsTableName,
	memberReferralsIdColumnName,
	memberReferralsSchema,
	memberReferralsCreateSchema,
	memberReferralsUpdateSchema,
} from "../schemas";
import { ControllerFactory } from "../controller";

export const createMemberReferralRoutes = (dbPool: Pool): Router => {
	const crudFactory = new CRUDFactory({
		tableName: memberReferralsTableName,
		idColumnName: memberReferralsIdColumnName,
	});

	const controllers = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: memberReferralsCreateSchema,
		updateSchema: memberReferralsUpdateSchema,
		tableSchema: memberReferralsSchema,
		conchScoped: true,
		idParamName: "memberReferralId",
	});
	const memberReferralRouteFactory = new RouteFactory(dbPool);

	return memberReferralRouteFactory.createRoutes(
		{
			getAll: "member",
			get: "member",
			post: "member",
			patch: "admin",
			delete: "admin",
		},
		controllers.createControllers(),
	);
};
