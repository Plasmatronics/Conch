import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { CRUDFactory } from "../queries";
import {
	relationshipsTableName,
	relationshipsIdColumnName,
	relationshipsSchema,
	relationshipsCreateSchema,
	relationshipsUpdateSchema,
} from "../schemas";
import { ControllerFactory } from "../controller";

export const createRelationshipRoutes = (dbPool: Pool): Router => {
	const crudFactory = new CRUDFactory({
		tableName: relationshipsTableName,
		idColumnName: relationshipsIdColumnName,
	});

	const controllers = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: relationshipsCreateSchema,
		updateSchema: relationshipsUpdateSchema,
		tableSchema: relationshipsSchema,
		conchScoped: true,
		idParamName: "relationshipId",
	});
	const relationshipRouteFactory = new RouteFactory(dbPool);

	return relationshipRouteFactory.createRoutes(
		{
			getAll: "member",
			get: "member",
			post: "member",
			patch: "member",
			delete: "member",
		},
		controllers.createControllers(),
	);
};
