import { Router } from "express";
import { Pool } from "pg";
import {
	createConch,
	getAllPersonalConches,
	getConch,
	updateConch,
	deleteConch,
} from "../controller";
import { auth, queryParamParser, verifySession } from "../middleware";
import { conchesQueryParamConfig } from "../schemas";

export const createConchRoutes = (dbPool: Pool): Router => {
	const conchRouter = Router();

	conchRouter.get(
		"",
		verifySession(dbPool),
		auth("authenticated"),
		queryParamParser(conchesQueryParamConfig),
		getAllPersonalConches(dbPool),
	);

	conchRouter.post(
		"",
		verifySession(dbPool),
		auth("authenticated"),
		createConch(dbPool),
	);

	conchRouter.patch(
		"/:conchId",
		verifySession(dbPool),
		auth("member"),
		updateConch(dbPool),
	);

	conchRouter.delete(
		"/:conchId",
		verifySession(dbPool),
		auth("admin"),
		deleteConch(dbPool),
	);

	conchRouter.get(
		"/:conchId",
		verifySession(dbPool),
		auth("member"),
		getConch(dbPool),
	);

	return conchRouter;
};
