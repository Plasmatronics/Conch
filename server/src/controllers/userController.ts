import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { AppError, catchError } from "../utils";
import { handlerFactory } from "./controllerFactory";
import { Types } from "mongoose";

const createUser = handlerFactory.createOne(User);

const getUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { include } = req.query; // e.g. ?include=member

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		let query = User.findById(id);

		if (include && include.toString().split(",").includes("member")) {
			query = query.populate({
				path: "familyTreeMember",
				select: "-__v",
			});
		}

		const member = await query;

		if (!member) {
			throw new AppError(404, "Could not find this document");
		}

		res.status(200).json({
			status: "success",
			data: member,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const updateUser = handlerFactory.updateOne(User);

const softDeleteUser = handlerFactory.softDeleteOne(User);

const cleanupAllDeletedUsers = handlerFactory.cleanupDeleted(User);

const restoreUser = handlerFactory.restoreOneSoftDeleted(User);

const restoreAllUsers = handlerFactory.restoreSoftDeleted(User);

const getManyUsers = handlerFactory.getMany(User);

export const userController = {
	createUser,
	getUser,
	updateUser,
	softDeleteUser,
	cleanupAllDeletedUsers,
	restoreUser,
	restoreAllUsers,
	getManyUsers,
};
