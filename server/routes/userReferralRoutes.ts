import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { CRUDFactory } from "../queries";
import {
	userReferralsTableName,
	userReferralsIdColumnName,
	userReferralsSchema,
	userReferralsCreateSchema,
	userReferralsUpdateSchema,
} from "../schemas";
import { ControllerFactory } from "../controller";

export const createUserReferralRoutes = (dbPool: Pool): Router => {
	const crudFactory = new CRUDFactory({
		tableName: userReferralsTableName,
		idColumnName: userReferralsIdColumnName,
	});

	const controllers = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: userReferralsCreateSchema,
		updateSchema: userReferralsUpdateSchema,
		tableSchema: userReferralsSchema,
		conchScoped: true,
		idParamName: "userReferralId",
	});
	const userReferralRouteFactory = new RouteFactory(dbPool);

	return userReferralRouteFactory.createRoutes(
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
