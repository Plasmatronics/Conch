import { Router } from "express";
import { Pool } from "pg";
import { RouteFactory } from "./RouteFactory";
import { mediaControllers } from "../controller";
import { mediaQueryParamConfig } from "../schemas";

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
		mediaQueryParamConfig,
	);
};
