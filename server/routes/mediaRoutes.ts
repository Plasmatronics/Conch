import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "../queries";
import {
	mediaTableName,
	mediaIdColumnName,
	mediaQuerySchema,
	mediaUpdateSchema,
} from "../schemas";

export const createMediaRoutes = (dbPool: Pool): Router => {
	const mediaRouteFactory = new RouteFactory(
		mediaTableName,
		dbPool,
		mediaIdColumnName,
		crudFactory,
		mediaQuerySchema,
		mediaUpdateSchema,
	);

	return mediaRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "member",
		patchRoute: "member",
		deleteRoute: "admin",
	});
};
