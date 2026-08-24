import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../../errors";
import { Pool } from "pg";
import { CRUDFactory } from "../../queries";
import { ZodObject } from "zod";
import { idSchema } from "../../schemas/utils";

export interface Controllers {
	getAll: RequestHandler;
	get: RequestHandler;
	post: RequestHandler;
	patch: RequestHandler;
	delete: RequestHandler;
}

interface ControllerFactoryConfig {
	dbPool: Pool;
	crudFactory: CRUDFactory;
	createSchema: ZodObject;
	updateSchema: ZodObject;
	tableSchema: ZodObject;
	conchScoped: boolean;
	idParamName: string;
}

export class ControllerFactory {
	private dbPool: Pool;
	private crudFactory: CRUDFactory;
	private createSchema: ZodObject;
	private updateSchema: ZodObject;
	private tableSchema: ZodObject;
	private conchScoped: boolean;
	private idParamName: string;

	constructor(config: ControllerFactoryConfig) {
		this.dbPool = config.dbPool;
		this.crudFactory = config.crudFactory;
		this.createSchema = config.createSchema;
		this.updateSchema = config.updateSchema;
		this.tableSchema = config.tableSchema;
		this.conchScoped = config.conchScoped;
		this.idParamName = config.idParamName;
	}

	private parseConchId(req: Request): number | undefined {
		if (!this.conchScoped) return undefined;

		const conchId = req.params.conchId;
		return idSchema.parse(conchId);
	}

	createControllers(): Controllers {
		const getAllController = async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			try {
				const conchId = this.parseConchId(req);
				const { text, values } = this.crudFactory.generateGetAll(conchId);

				const queryResponse = await this.dbPool.query(text, values);
				const rows = this.tableSchema.array().parse(queryResponse.rows);

				return res.status(200).json(rows);
			} catch (err: unknown) {
				return next(err);
			}
		};

		const postController = async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			try {
				const tableUpdates = this.createSchema.parse(req.body);
				const conchId = this.parseConchId(req);

				const { text, values } = this.crudFactory.generateCreateOne(
					tableUpdates,
					conchId,
				);

				const queryResponse = await this.dbPool.query(text, values);
				const row = this.tableSchema.parse(queryResponse.rows[0]);

				return res.status(201).json(row);
			} catch (err: unknown) {
				return next(err);
			}
		};

		const getController = async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			try {
				const resourceId = idSchema.parse(req.params[this.idParamName]);
				const conchId = this.parseConchId(req);

				const { text, values } = this.crudFactory.generateGetOne(
					resourceId,
					conchId,
				);

				const queryResponse = await this.dbPool.query(text, values);
				if (!queryResponse.rowCount)
					throw new AppError(`Resource with ID ${resourceId} not found.`, 404);
				const row = this.tableSchema.parse(queryResponse.rows[0]);

				return res.status(200).json(row);
			} catch (err: unknown) {
				return next(err);
			}
		};

		const patchController = async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			try {
				const resourceId = idSchema.parse(req.params[this.idParamName]);
				const conchId = this.parseConchId(req);

				const tableUpdates = this.updateSchema.parse(req.body);

				const { text, values } = this.crudFactory.generateUpdateOne(
					tableUpdates,
					resourceId,
					conchId,
				);
				const queryResponse = await this.dbPool.query(text, values);
				if (!queryResponse.rowCount)
					throw new AppError(`Resource with ID ${resourceId} not found.`, 404);

				const row = this.tableSchema.parse(queryResponse.rows[0]);
				return res.status(200).json(row);
			} catch (err: unknown) {
				return next(err);
			}
		};

		const deleteController = async (
			req: Request,
			res: Response,
			next: NextFunction,
		) => {
			try {
				const resourceId = idSchema.parse(req.params[this.idParamName]);
				const conchId = this.parseConchId(req);

				const { text, values } = this.crudFactory.generateDeleteOne(
					resourceId,
					conchId,
				);
				const queryResponse = await this.dbPool.query(text, values);
				if (!queryResponse.rowCount)
					throw new AppError(`Resource with ID ${resourceId} not found.`, 404);
				const row = this.tableSchema.parse(queryResponse.rows[0]);

				return res.status(200).json(row);
			} catch (err: unknown) {
				return next(err);
			}
		};

		return {
			getAll: getAllController,
			get: getController,
			patch: patchController,
			post: postController,
			delete: deleteController,
		};
	}
}
