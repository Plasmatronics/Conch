import { RequestHandler, Router } from "express";
import { Pool } from "pg";
import { CRUDFactory } from "../queries";
import z, { ZodObject } from "zod";
import { RouteAccessConfig } from "../types";
import { auth, verifySession } from "../middleware";
import { AppError } from "../errors";
import { paramId } from "../schemas/utils";

export class RouteFactory {
	constructor(
		private tableName: string,
		private dbPool: Pool,
		private idColumnName: string,
		private crudFactory: CRUDFactory,
		private createSchema: ZodObject,
		private updateSchema: ZodObject,
	) {}

	createRoutes({
		getRoute = "member",
		getAllRoute = "member",
		postRoute = "member",
		patchRoute = "member",
		deleteRoute = "member",
	}: RouteAccessConfig): Router {
		const router = Router();

		router.param("conchId", (_req, res, next, conchId) => {
			try {
				const parsedConchId = paramId.parse(conchId);
				res.locals.conchId = Number(parsedConchId);
				next();
			} catch (err) {
				return next(err);
			}
		});

		const getAllMiddlewares: RequestHandler[] = [];
		if (getAllRoute !== "public")
			getAllMiddlewares.push(verifySession(this.dbPool));
		getAllMiddlewares.push(auth(getAllRoute));
		router.get("", ...getAllMiddlewares, async (_req, res, next) => {
			try {
				const { text, values } = this.crudFactory.generateGetAll(
					this.tableName,
				);

				const queryResponse = await this.dbPool.query(text, values);
				return res.status(200).json(queryResponse.rows ?? null);
			} catch (err: unknown) {
				return next(err);
			}
		});

		const postMiddlewares: RequestHandler[] = [];
		if (postRoute !== "public")
			postMiddlewares.push(verifySession(this.dbPool));
		postMiddlewares.push(auth(postRoute));
		router.post("", ...postMiddlewares, async (req, res, next) => {
			try {
				const tableUpdates = this.createSchema.parse(req.body);
				const { text, values } = this.crudFactory.generateCreateOne(
					this.tableName,
					tableUpdates,
				);

				const queryResponse = await this.dbPool.query(text, values);
				return res.status(201).json(queryResponse.rows[0] ?? []);
			} catch (err: unknown) {
				return next(err);
			}
		});

		router.param("id", (_req, res, next, id) => {
			try {
				const parsedResourceId = paramId.parse(id);
				res.locals.resourceId = Number(parsedResourceId);
				next();
			} catch (err) {
				return next(err);
			}
		});

		const getOneMiddlewares: RequestHandler[] = [];
		if (getRoute !== "public")
			getOneMiddlewares.push(verifySession(this.dbPool));
		getOneMiddlewares.push(auth(getRoute));
		router.get("/:id", ...getOneMiddlewares, async (_req, res, next) => {
			try {
				const resourceId = res.locals.resourceId as number;

				const { text, values } = this.crudFactory.generateGetOne(
					this.tableName,
					this.idColumnName,
					String(resourceId),
				);

				const queryResponse = await this.dbPool.query(text, values);

				if (!queryResponse.rows.length)
					throw new AppError(
						`${this.tableName} with ID ${resourceId} not found.`,
						404,
					);

				return res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				return next(err);
			}
		});

		const patchMiddlewares: RequestHandler[] = [];
		if (patchRoute !== "public")
			patchMiddlewares.push(verifySession(this.dbPool));
		patchMiddlewares.push(auth(patchRoute));
		router.patch("/:id", ...patchMiddlewares, async (req, res, next) => {
			try {
				const resourceId = res.locals.resourceId as number;

				const tableUpdates = this.updateSchema.parse(req.body);
				const { text, values } = this.crudFactory.generateUpdateOne(
					this.tableName,
					tableUpdates,
					this.idColumnName,
					String(resourceId),
				);

				const queryResponse = await this.dbPool.query(text, values);
				if (!queryResponse.rows.length)
					throw new AppError(
						`${this.tableName} with ID ${resourceId} not found.`,
						404,
					);

				return res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				return next(err);
			}
		});

		const deleteMiddlewares: RequestHandler[] = [];
		if (deleteRoute !== "public")
			deleteMiddlewares.push(verifySession(this.dbPool));
		deleteMiddlewares.push(auth(deleteRoute));
		router.delete("/:id", ...deleteMiddlewares, async (_req, res, next) => {
			try {
				const resourceId = res.locals.resourceId as number;

				const { text, values } = this.crudFactory.generateDeleteOne(
					this.tableName,
					this.idColumnName,
					String(resourceId),
				);

				const queryResponse = await this.dbPool.query(text, values);

				if (!queryResponse.rows.length)
					throw new AppError(
						`${this.tableName} with ID ${resourceId} not found.`,
						404,
					);
				return res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				return next(err);
			}
		});

		return router;
	}
}
