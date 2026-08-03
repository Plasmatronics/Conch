import { Router } from "express";
import {
	claimsTableName,
	claimsIdColumnName,
	claimsUpdateSchema,
	claimsCreateSchema,
} from "../schemas";
import { RouteFactory } from "./RouteFactory";
import { Pool } from "pg";
import { crudFactory } from "./CRUDFactory";

export const createConchRoutes = (dbPool: Pool): Router => {
	const conchRouteFactory = new RouteFactory(
		claimsTableName,
		dbPool,
		claimsIdColumnName,
		crudFactory,
		claimsCreateSchema,
		claimsUpdateSchema,
	);

	return conchRouteFactory.createRoutes();
};
