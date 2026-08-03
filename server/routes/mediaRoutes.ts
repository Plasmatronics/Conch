import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	mediaTableName,
	mediaIdColumnName,
	mediaCreateSchema,
	mediaUpdateSchema,
} from "../schemas";

export const createMediaRoutes = (dbPool: Pool): Router => {
	const mediaRouteFactory = new RouteFactory(
		mediaTableName,
		dbPool,
		mediaIdColumnName,
		crudFactory,
		mediaCreateSchema,
		mediaUpdateSchema,
	);

	return mediaRouteFactory.createRoutes();
};
