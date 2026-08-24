import { RequestHandler, Router } from "express";
import { Pool } from "pg";
import { RouteAccessConfig } from "../types";
import { auth, verifySession } from "../middleware";
import { Controllers } from "../controller";

export class RouteFactory {
	constructor(private dbPool: Pool) {}

	createRoutes(
		accessConfig: RouteAccessConfig,
		controllers: Controllers,
	): Router {
		const {
			getAll: getAllAccess,
			get: getAccess,
			post: postAccess,
			patch: patchAccess,
			delete: deleteAccess,
		} = accessConfig;

		const {
			getAll: getAllController,
			get: getController,
			post: postController,
			patch: patchController,
			delete: deleteController,
		} = controllers;

		const router = Router({ mergeParams: true });

		const getAllMiddlewares: RequestHandler[] = [];
		if (getAllAccess !== "public")
			getAllMiddlewares.push(verifySession(this.dbPool));
		getAllMiddlewares.push(auth(getAllAccess));
		router.get("", ...getAllMiddlewares, getAllController);

		const postMiddlewares: RequestHandler[] = [];
		if (postAccess !== "public")
			postMiddlewares.push(verifySession(this.dbPool));
		postMiddlewares.push(auth(postAccess));
		router.post("", ...postMiddlewares, postController);

		const getOneMiddlewares: RequestHandler[] = [];
		if (getAccess !== "public")
			getOneMiddlewares.push(verifySession(this.dbPool));
		getOneMiddlewares.push(auth(getAccess));
		router.get("/:id", ...getOneMiddlewares, getController);

		const patchMiddlewares: RequestHandler[] = [];
		if (patchAccess !== "public")
			patchMiddlewares.push(verifySession(this.dbPool));
		patchMiddlewares.push(auth(patchAccess));
		router.patch("/:id", ...patchMiddlewares, patchController);

		const deleteMiddlewares: RequestHandler[] = [];
		if (deleteAccess !== "public")
			deleteMiddlewares.push(verifySession(this.dbPool));
		deleteMiddlewares.push(auth(deleteAccess));
		router.delete("/:id", ...deleteMiddlewares, deleteController);

		return router;
	}
}
