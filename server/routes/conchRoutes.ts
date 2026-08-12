import { Router } from "express";
import { Pool } from "pg";
import {
	createConch,
	getAllPersonalConches,
	getConch,
	updateConch,
	deleteConch,
} from "../controller";
import { auth, verifySession } from "../middleware";
import z from "zod";

export const createConchRoutes = (dbPool: Pool): Router => {
	const conchRouter = Router();

	conchRouter.get(
		"",
		verifySession(dbPool),
		auth("authenticated"),
		getAllPersonalConches(dbPool),
	);

	conchRouter.post(
		"",
		verifySession(dbPool),
		auth("authenticated"),
		createConch(dbPool),
	);

	conchRouter.param("conchId", (_req, res, next, conchId) => {
		try {
			const parsedConchId = z.string().regex(/^\d+$/).parse(conchId);
			res.locals.conchId = Number(parsedConchId);
			next();
		} catch (err) {
			next(err);
		}
	});

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
