import { NextFunction, Request, Response } from "express";
import { Story } from "../models";
import { handlerFactory } from "./controllerFactory";
import { AppError, catchError } from "../utils";
import { Types } from "mongoose";

const createStory = handlerFactory.createOne(Story);

const getStory = handlerFactory.readOne(Story);

const updateStory = handlerFactory.updateOne(Story);

const softDeleteStory = handlerFactory.softDeleteOne(Story);

const cleanupAllDeletedStories = handlerFactory.cleanupDeleted(Story);

const restoreStory = handlerFactory.restoreOneSoftDeleted(Story);

const restoreAllStories = handlerFactory.restoreSoftDeleted(Story);

const getManyStories = handlerFactory.getMany(Story);

const getStoryComments = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { id } = req.params;

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		const storyWithComments = await Story.findById(id).populate({
			path: "comments",
			select: "content author likes createdAt",
			match: { parentComment: { $exists: false } },
			populate: {
				path: "replies",
				match: { deletedAt: { $exists: false } },
				select: "-__v",
				options: { sort: { createdAt: 1 } },
			},
		});

		if (!storyWithComments) {
			throw new AppError(404, "Could not find this document");
		}

		res.status(200).json({
			status: "success",
			data: storyWithComments,
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const storyController = {
	createStory,
	getStory,
	updateStory,
	softDeleteStory,
	cleanupAllDeletedStories,
	restoreStory,
	restoreAllStories,
	getManyStories,
	getStoryComments,
};
