import { Request, Response, NextFunction } from "express";
import { Document, Model, Types } from "mongoose";
import { AppError, catchError, QueryBuilder } from "../utils";
import { User } from "../models";

/**
 * Creates a new document
 */
const createOne =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const doc: T | T[] | null = await Model.create(req.body);
			let userObj = null;

			if (!doc) throw new AppError(400, "could not create document");

			if (doc instanceof User) {
				userObj = doc.toObject();
				delete userObj.password;
			}

			res.status(201).json({
				status: "success",
				data: userObj || doc,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Reads a single document by ID
 */
const readOne =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			if (!Types.ObjectId.isValid(id)) {
				throw new AppError(400, "Invalid ID format");
			}

			const doc = await Model.findById(id);

			if (!doc) {
				throw new AppError(404, "Could not find this document");
			}

			res.status(200).json({
				status: "success",
				data: doc,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Updates a document by ID
 */
const updateOne =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { id } = req.params;

			if (!Types.ObjectId.isValid(id)) {
				throw new AppError(400, "Invalid ID format");
			}

			const doc = await Model.findByIdAndUpdate(id, req.body, {
				new: true,
				runValidators: true,
			});

			if (!doc) {
				throw new AppError(404, "Could not update this document");
			}

			res.status(200).json({
				status: "success",
				data: doc,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Deletes a document by ID
 */
const deleteOne =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			if (!Types.ObjectId.isValid(id)) {
				throw new AppError(400, "Invalid ID format");
			}

			const doc = await Model.findByIdAndDelete(id);

			if (!doc) {
				throw new AppError(404, "Could not delete this document");
			}

			res.status(204).json({
				status: "success",
				data: null,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Gets all documents
 */
const getAll =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const docQuery = new QueryBuilder(Model.find(), req.query)
				.filter()
				.paginate()
				.sort()
				.limitFields();

			const docs = await docQuery.query;

			res.status(200).json({
				status: "success",
				length: docs.length,
				data: docs,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

export const handlerFactory = {
	createOne,
	readOne,
	updateOne,
	deleteOne,
	getAll,
};
