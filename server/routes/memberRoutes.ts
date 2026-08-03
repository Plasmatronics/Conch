import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { crudFactory } from "./CRUDFactory";
import {
	membersTableName,
	membersIdColumnName,
	membersCreateSchema,
	membersUpdateSchema,
} from "../schemas";

export const createMemberRoutes = (dbPool: Pool): Router => {
	const memberRouteFactory = new RouteFactory(
		membersTableName,
		dbPool,
		membersIdColumnName,
		crudFactory,
		membersCreateSchema,
		membersUpdateSchema,
	);

	return memberRouteFactory.createRoutes();
};
