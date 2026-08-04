import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	claimsTableName,
	claimsIdColumnName,
	claimsCreateSchema,
	claimsUpdateSchema,
} from "../schemas";

export const createClaimRoutes = (dbPool: Pool): Router => {
	const claimRouteFactory = new RouteFactory(
		claimsTableName,
		dbPool,
		claimsIdColumnName,
		crudFactory,
		claimsCreateSchema,
		claimsUpdateSchema,
	);

	return claimRouteFactory.createRoutes();
};
