import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	postMediaTableName,
	postMediaIdColumnName,
	postMediaCreateSchema,
	postMediaUpdateSchema,
} from "../schemas";

export const createPostMediaRoutes = (dbPool: Pool): Router => {
	const postMediaRouteFactory = new RouteFactory(
		postMediaTableName,
		dbPool,
		postMediaIdColumnName,
		crudFactory,
		postMediaCreateSchema,
		postMediaUpdateSchema,
	);

	return postMediaRouteFactory.createRoutes();
};
