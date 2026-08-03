import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	postsTableName,
	postsIdColumnName,
	postsCreateSchema,
	postsUpdateSchema,
} from "../schemas";

export const createPostRoutes = (dbPool: Pool): Router => {
	const postRouteFactory = new RouteFactory(
		postsTableName,
		dbPool,
		postsIdColumnName,
		crudFactory,
		postsCreateSchema,
		postsUpdateSchema,
	);

	return postRouteFactory.createRoutes();
};
