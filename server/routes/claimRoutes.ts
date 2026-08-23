import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { CRUDFactory } from "../queries";
import {
	claimsTableName,
	claimsIdColumnName,
	claimsSchema,
	claimsCreateSchema,
	claimsUpdateSchema,
} from "../schemas";
import { ControllerFactory } from "../controller";

export const createClaimRoutes = (dbPool: Pool): Router => {
	const crudFactory = new CRUDFactory({
		tableName: claimsTableName,
		idColumnName: claimsIdColumnName,
	});
	const controllers = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: claimsCreateSchema,
		updateSchema: claimsUpdateSchema,
		tableSchema: claimsSchema,
		conchScoped: true,
		idParamName: "claimId",
	});
	const claimRouteFactory = new RouteFactory(dbPool);

	return claimRouteFactory.createRoutes(
		{
			getAll: "member",
			get: "member",
			post: "admin",
			patch: "admin",
			delete: "admin",
		},
		controllers.createControllers(),
	);
};
