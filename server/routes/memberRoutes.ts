import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { membersControllers } from "../controller";

export const createMemberRoutes = (dbPool: Pool): Router => {
	const memberRouteFactory = new RouteFactory(dbPool);

	return memberRouteFactory.createRoutes(
		{
			getAll: "member",
			get: "member",
			post: "admin",
			patch: "member",
			delete: "admin",
		},
		membersControllers(dbPool),
	);
};
