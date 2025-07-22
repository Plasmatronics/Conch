import { Request, Response, NextFunction } from "express";
import { Document, Model, Types } from "mongoose";
import { AppError } from "../utils";
import { User } from "../models";

type CrudOperation = "create" | "read" | "update" | "delete" | "getAll";

/**
 * Generates a CRUD handler for a given operation on a Mongoose model.
 *
 * @param operation - One of 5 basic CRUD operations.
 * @returns A function that accepts a Mongoose model and returns an Express request handler.
 */

const simpleCrud =
	(operation: CrudOperation) =>
	<T extends Document>(Model: Model<T>) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id;
			let doc: T | T[] | null = null;
			let userObj = null;
			let statusCode = 200;
			let errMessage = "This document could not be found";

			if (["read", "update", "delete"].includes(operation)) {
				if (!Types.ObjectId.isValid(id)) {
					throw new AppError(400, "Invalid ID format");
				}
			}

			switch (operation) {
				case "create":
					doc = await Model.create(req.body);
					if (doc instanceof User) {
						userObj = doc.toObject();
						delete userObj.password;
					}

					statusCode = 201;

					if (!doc) errMessage = "Could not create this document";
					break;
				case "read":
					doc = await Model.findById(id);

					if (!doc) errMessage = "Could not find this document";
					break;
				case "update":
					doc = await Model.findByIdAndUpdate(id, req.body, {
						new: true,
						runValidators: true,
					});

					if (!doc) errMessage = "Could not update this document";
					break;
				case "delete":
					doc = await Model.findByIdAndDelete(id);

					if (!doc) errMessage = "Could not delete this document";
					break;
				case "getAll":
					//getting no results back from get all isn't an error
					doc = await Model.find();

					break;
			}

			if (operation !== "getAll" && !doc) throw new AppError(404, errMessage);

			res.status(statusCode).json({ status: "success", data: userObj || doc });
		} catch (err) {
			if (err instanceof AppError) {
				return next(err);
			}

			console.error("💥", err);
			return next(
				new AppError(
					500,
					err instanceof Error ? err.message : "Something went very wrong",
				),
			);
		}
	};

const createOne = simpleCrud("create");
const readOne = simpleCrud("read");
const updateOne = simpleCrud("update");
const deleteOne = simpleCrud("delete");
const getAll = simpleCrud("getAll");

export const handlerFactory = {
	createOne,
	readOne,
	updateOne,
	deleteOne,
	getAll,
};
