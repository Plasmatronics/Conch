import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "../queries";
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

	return postRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "member",
		patchRoute: "member",
		deleteRoute: "admin",
	});
};
