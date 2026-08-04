import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	postMembersTableName,
	postMembersIdColumnName,
	postMembersCreateSchema,
	postMembersUpdateSchema,
} from "../schemas";

export const createPostMemberRoutes = (dbPool: Pool): Router => {
	const postMemberRouteFactory = new RouteFactory(
		postMembersTableName,
		dbPool,
		postMembersIdColumnName,
		crudFactory,
		postMembersCreateSchema,
		postMembersUpdateSchema,
	);

	return postMemberRouteFactory.createRoutes();
};
