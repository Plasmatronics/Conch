import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { CRUDFactory } from "../queries";
import {
	usersTableName,
	usersIdColumnName,
	usersSchema,
	usersCreateSchema,
	usersUpdateSchema,
} from "../schemas";
import { ControllerFactory } from "../controller";

export const createUserRoutes = (dbPool: Pool): Router => {
	const crudFactory = new CRUDFactory({
		tableName: usersTableName,
		idColumnName: usersIdColumnName,
	});

	const controllers = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: usersCreateSchema,
		updateSchema: usersUpdateSchema,
		tableSchema: usersSchema,
		conchScoped: false,
		idParamName: "userId",
	});
	const userRouteFactory = new RouteFactory(dbPool);

	return userRouteFactory.createRoutes(
		{
			getAll: "admin",
			get: "admin",
			post: "admin",
			patch: "admin",
			delete: "admin",
		},
		controllers.createControllers(),
	);
};
