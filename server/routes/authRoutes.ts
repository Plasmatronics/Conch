import { Router, Request, Response } from "express";
import { Pool } from "pg";
import {
	auth,
	createSession,
	revokeSession,
	verifySession,
} from "../middleware";
import { signupUser, loginUser, retrieveUser, patchUser } from "../controller";

export const createAuthRoutes = (dbPool: Pool): Router => {
	const authRouter = Router();

	authRouter.post(
		"/signup",
		auth("public"),
		signupUser(dbPool),
		createSession(dbPool),
		async (req: Request, res: Response) => {
			return res.status(201).json(req.user);
		},
	);

	authRouter.post(
		"/login",
		auth("public"),
		loginUser(dbPool),
		createSession(dbPool),
		async (req: Request, res: Response) => {
			return res.status(200).json(req.user);
		},
	);

	authRouter.post(
		"/logout",
		auth("authenticated"),
		revokeSession(dbPool),
		async (_req: Request, res: Response) => {
			return res.status(205).json({ message: "Succesfully logged out" });
		},
	);

	authRouter.patch(
		"/me",
		auth("authenticated"),
		verifySession(dbPool),
		patchUser(dbPool),
	);

	authRouter.get(
		"/me",
		auth("authenticated"),
		verifySession(dbPool),
		retrieveUser(dbPool),
	);

	return authRouter;
};
