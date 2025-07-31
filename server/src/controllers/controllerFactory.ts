import { Request, Response, NextFunction } from "express";
import { Document, Model, Types } from "mongoose";
import { AppError, catchError, QueryBuilder, S3Service } from "../utils";
import { MediaDoc, DocumentDoc } from "../models";

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

			if (Model.modelName === "User") {
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
 * Deletes a document by ID immediately
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

			res.status(204).send();
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Marks document to be deleted in 24hrs
 */
const softDeleteOne =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			if (!Types.ObjectId.isValid(id)) {
				throw new AppError(400, "Invalid ID format");
			}

			if (Model.modelName === "Like") {
				throw new AppError(
					500,
					"Likes have no soft deletion process. Hard delete another resource",
				);
			}

			const doc = await Model.findByIdAndUpdate(id, {
				deletedAt: Date.now(),
			});

			if (!doc) {
				throw new AppError(404, "Could not delete this document");
			}

			res.status(204).send();
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Hard deletes all documents that have been marked for deletion over 24hrs ago
 */
const cleanupDeleted =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			//Soft delete everything besides Likes
			if (Model.modelName === "Like") {
				throw new AppError(400, "Likes have no soft deletion process.");
			}

			const oneDay = 1000 * 60 * 60 * 24;
			const oneDayAgo = Date.now() - oneDay;
			if (Model.modelName === "Media" || Model.modelName === "Document") {
				const docs: MediaDoc[] | DocumentDoc[] = await Model.find({
					deletedAt: { $lt: oneDayAgo },
				});

				if (docs.length === 0) {
					return res.status(200).json({ message: "No documents found to delete." });
				}

				const docFileKeys = docs
					.map((doc) => {
						return doc.fileKey;
					})
					.filter(Boolean);

				const deleteFromS3Promise =
					S3Service.getS3Client().deleteManyFilesFromBucket(docFileKeys);

				const deletedDocsPromise = Model.deleteMany({
					deletedAt: { $lt: oneDayAgo },
				});

				await Promise.all([deleteFromS3Promise, deletedDocsPromise]);
			} else {
				const deletedDocs = await Model.deleteMany({
					deletedAt: { $lt: oneDayAgo },
				});
				if (deletedDocs.deletedCount === 0) {
					throw new AppError(404, "Could not delete documents");
				}
			}

			res.status(204).send();
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Restores soft-deleted documents by removing the `deletedAt` field
 */
const restoreSoftDeleted =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (Model.modelName === "Like") {
				throw new AppError(
					400,
					"Likes cannot be restored. Simply relike desired post",
				);
			}

			const docs = await Model.updateMany(
				{ deletedAt: { $exists: true, $ne: null } },
				{ $unset: { deletedAt: 1 } },
			);

			if (docs.modifiedCount === 0) {
				throw new AppError(400, "Could not restore all deleted documents.");
			}

			res.status(200).json({
				status: "success",
				data: docs,
			});
		} catch (err) {
			catchError(err, next);
		}
	};

/**
 * Restores a single soft-deleted document by unsetting its `deletedAt` field.
 */
const restoreOneSoftDeleted =
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (Model.modelName === "Like") {
				throw new AppError(
					400,
					"Likes cannot be restored. Simply relike desired post",
				);
			}

			const { id } = req.params;

			if (!Types.ObjectId.isValid(id)) {
				throw new AppError(400, "Invalid ID format");
			}

			const doc = await Model.findByIdAndUpdate(id, { $unset: { deletedAt: 1 } }, { new: true });

			if (!doc) {
				throw new AppError(404, "Could not restore specified document.");
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
	softDeleteOne,
	cleanupDeleted,
	restoreSoftDeleted,
	restoreOneSoftDeleted,
	getAll,
};
