import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "../queries";
import {
	usersTableName,
	usersIdColumnName,
	usersCreateSchema,
	usersUpdateSchema,
} from "../schemas";

export const createUserRoutes = (dbPool: Pool): Router => {
	const userRouteFactory = new RouteFactory(
		usersTableName,
		dbPool,
		usersIdColumnName,
		crudFactory,
		usersCreateSchema,
		usersUpdateSchema,
	);

	return userRouteFactory.createRoutes({
		getAllRoute: "admin",
		getRoute: "admin",
		postRoute: "admin",
		patchRoute: "admin",
		deleteRoute: "admin",
	});
};
