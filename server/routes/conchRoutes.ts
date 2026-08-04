import { Router } from "express";
import {
	conchesTableName,
	conchesIdColumnName,
	conchesUpdateSchema,
	conchesCreateSchema,
} from "../schemas";
import { RouteFactory } from "./RouteFactory";
import { Pool } from "pg";
import { crudFactory } from "./CRUDFactory";

export const createConchRoutes = (dbPool: Pool): Router => {
	const conchRouteFactory = new RouteFactory(
		conchesTableName,
		dbPool,
		conchesIdColumnName,
		crudFactory,
		conchesCreateSchema,
		conchesUpdateSchema,
	);

	return conchRouteFactory.createRoutes();
};
