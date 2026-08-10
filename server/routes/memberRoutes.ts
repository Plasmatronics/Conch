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

	return memberRouteFactory.createRoutes({
		getAllRoute: "member",
		getRoute: "member",
		postRoute: "admin",
		patchRoute: "member",
		deleteRoute: "admin",
	});
};
