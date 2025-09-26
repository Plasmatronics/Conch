import { Request, Response, NextFunction } from "express";
import { Comment, Like } from "../models";
import { handlerFactory } from "./controllerFactory";
import { Types } from "mongoose";
import { AppError, catchError } from "../utils";

const createComment = handlerFactory.createOne(Comment);

const getComment = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { include } = req.query; // e.g. ?include=replies

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		let query = Comment.findById(id);
		if (include && include.toString().split(",").includes("replies")) {
			query = query.populate({
				path: "replies",
				match: { deletedAt: { $exists: false } },
				select: "-__v",
				options: { sort: { createdAt: 1 } },
			});
		}

		const comment = await query;

		if (!comment) {
			throw new AppError(404, "Could not find this document");
		}

		const currentUserId = req.user?.id;
		const like = await Like.findOne({
			author: currentUserId,
			target: id,
		});
		const isLikedByUser = !!like;

		res.status(200).json({
			status: "success",
			data: { ...comment, isLikedByUser },
		});
	} catch (err) {
		catchError(err, next);
	}
};

const updateComment = handlerFactory.updateOne(Comment);

const softDeleteComment = handlerFactory.softDeleteOne(Comment);

const cleanupAllDeletedComments = handlerFactory.cleanupDeleted(Comment);

const restoreComment = handlerFactory.restoreOneSoftDeleted(Comment);

const restoreAllComments = handlerFactory.restoreSoftDeleted(Comment);

const getManyComments = handlerFactory.getMany(Comment);

export const commentController = {
	createComment,
	getComment,
	updateComment,
	softDeleteComment,
	cleanupAllDeletedComments,
	restoreComment,
	restoreAllComments,
	getManyComments,
};
