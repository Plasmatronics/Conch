import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "../queries";
import {
	relationshipsTableName,
	relationshipsIdColumnName,
	relationshipsCreateSchema,
	relationshipsUpdateSchema,
} from "../schemas";

export const createRelationshipRoutes = (dbPool: Pool): Router => {
	const relationshipRouteFactory = new RouteFactory(
		relationshipsTableName,
		dbPool,
		relationshipsIdColumnName,
		crudFactory,
		relationshipsCreateSchema,
		relationshipsUpdateSchema,
	);

	return relationshipRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "member",
		patchRoute: "member",
		deleteRoute: "member",
	});
};
