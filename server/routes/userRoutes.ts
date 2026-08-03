import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
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

	return userRouteFactory.createRoutes();
};
