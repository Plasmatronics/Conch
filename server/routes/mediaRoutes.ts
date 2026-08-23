import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { mediaControllers } from "../controller";

export const createMediaRoutes = (dbPool: Pool): Router => {
	const mediaRouteFactory = new RouteFactory(dbPool);

	return mediaRouteFactory.createRoutes(
		{
			getAll: "member",
			get: "member",
			post: "member",
			patch: "member",
			delete: "admin",
		},
		mediaControllers(dbPool),
	);
};
