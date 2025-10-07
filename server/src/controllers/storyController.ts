import { NextFunction, Request, Response } from "express";
import { Like, Story } from "../models";
import { handlerFactory } from "./controllerFactory";
import { AppError, catchError, hasUserLikedStoryOrComments } from "../utils";
import { Types } from "mongoose";
import { PopulatedCommentDTO, PopulatedStoryDTO } from "packages/shared";

const createStory = handlerFactory.createOne(Story);

const updateStory = handlerFactory.updateOne(Story);

const softDeleteStory = handlerFactory.softDeleteOne(Story);

const cleanupAllDeletedStories = handlerFactory.cleanupDeleted(Story);

const restoreStory = handlerFactory.restoreOneSoftDeleted(Story);

const restoreAllStories = handlerFactory.restoreSoftDeleted(Story);

const getManyStories = handlerFactory.getMany(Story);

const getStory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		const story = await Story.findById(id);

		if (!story) {
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
			data: { ...story, isLikedByUser },
		});
	} catch (err) {
		catchError(err, next);
	}
};

const getStoryWithComments = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { id } = req.params;

		if (id && !Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		const query = id ? Story.findById(id) : Story.find();

		const stories = await query.populate({
			path: "comments",
			select: "content author likes createdAt deletedAt",
			match: {
				deletedAt: { $exists: false },
			},
			populate: {
				path: "replies",
				match: { deletedAt: { $exists: false } },
				select: "-__v",
				options: { sort: { createdAt: 1 } },
			},
		});

		if (id && !stories) {
			throw new AppError(404, "Could not find this document");
		}

		const currentUserId = req.user?.id;
		const data = await hasUserLikedStoryOrComments(
			stories || [],
			currentUserId,
		);

		res.status(200).json({
			status: "success",
			data,
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
	getStoryWithComments,
};
