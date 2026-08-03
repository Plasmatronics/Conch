import { Router } from "express";
import { Pool } from "pg";
import { CRUDFactory } from "./CRUDFactory";
import z, { ZodObject } from "zod";

export class RouteFactory {
	constructor(
		private tableName: string,
		private dbPool: Pool,
		private idColumnName: string,
		private crudFactory: CRUDFactory,
		private createSchema: ZodObject,
		private updateSchema: ZodObject,
	) {}

	createRoutes(): Router {
		const router = Router();

		router.get("", async (_req, res, next) => {
			try {
				const { text, values } = this.crudFactory.generateGetAll(
					this.tableName,
				);

				const queryResponse = await this.dbPool.query(text, values);
				res.status(200).json(queryResponse.rows ?? null);
			} catch (err: unknown) {
				next(err);
			}
		});

		router.post("", async (req, res, next) => {
			try {
				const tableUpdates = this.createSchema.parse(req.body);
				const { text, values } = this.crudFactory.generateCreateOne(
					this.tableName,
					tableUpdates,
				);

				const queryResponse = await this.dbPool.query(text, values);
				res.status(201).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				next(err);
			}
		});

		router.param("id", (_req, res, next, id) => {
			try {
				const parsedId = z.string().regex(/^\d+$/).parse(id);
				res.locals.parsedId = parsedId;
				next();
			} catch (err) {
				next(err);
			}
		});

		router.get("/:id", async (_req, res, next) => {
			try {
				const id = res.locals.parsedId as string;

				const { text, values } = this.crudFactory.generateGetOne(
					this.tableName,
					this.idColumnName,
					id,
				);

				const queryResponse = await this.dbPool.query(text, values);
				res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				next(err);
			}
		});

		router.patch("/:id", async (req, res, next) => {
			try {
				const id = res.locals.parsedId as string;

				const tableUpdates = this.updateSchema.parse(req.body);
				const { text, values } = this.crudFactory.generateUpdateOne(
					this.tableName,
					tableUpdates,
					this.idColumnName,
					id,
				);

				const queryResponse = await this.dbPool.query(text, values);
				res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				next(err);
			}
		});

		router.delete("/:id", async (req, res, next) => {
			try {
				const id = res.locals.parsedId as string;

				const { text, values } = this.crudFactory.generateDeleteOne(
					this.tableName,
					this.idColumnName,
					id,
				);

				const queryResponse = await this.dbPool.query(text, values);
				res.status(200).json(queryResponse.rows[0] ?? null);
			} catch (err: unknown) {
				next(err);
			}
		});

		return router;
	}
}
