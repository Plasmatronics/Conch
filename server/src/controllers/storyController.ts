import { NextFunction, Request, Response } from "express";
import { Like, Story } from "../models";
import { handlerFactory } from "./controllerFactory";
import { AppError, catchError } from "../utils";
import { Types } from "mongoose";
import { PopulatedStoryDTO } from "packages/shared";

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

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		const story = await Story.findById(id).populate({
			path: "comments",
			select: "content author likes createdAt deletedAt",
			match: {
				parentComment: { $exists: false },
				deletedAt: { $exists: false },
			},
			populate: {
				path: "replies",
				match: { deletedAt: { $exists: false } },
				select: "-__v",
				options: { sort: { createdAt: 1 } },
			},
		});

		if (!story) {
			throw new AppError(404, "Could not find this document");
		}

		const currentUserId = req.user?.id;
		let likedSet = new Set<string>();
		if (currentUserId) {
			const ids: Types.ObjectId[] = [story.id];

			for (const comment of story.comments as any[]) {
				if (comment && comment.id) ids.push(comment.id);

				for (const reply of comment.replies) {
					if (reply && reply.id) ids.push(reply.id);
				}
			}

			const likes = await Like.find({
				author: currentUserId,
				target: { $in: ids },
			}).select("target");

			likedSet = new Set(likes.map((like) => like.target.id.toString()));
		}

		const storyObj = story.toObject() as unknown as PopulatedStoryDTO & {
			isLikedByUser?: boolean;
		};

		storyObj.isLikedByUser = likedSet.has(storyObj.id.toString());

		if (storyObj.comments) {
			for (const comment of storyObj.comments || []) {
				comment.isLikedByUser = likedSet.has(comment.id.toString());
				for (const reply of comment.replies || []) {
					reply.isLikedByUser = likedSet.has(reply.id.toString());
				}
			}
		}

		res.status(200).json({
			status: "success",
			data: storyObj,
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
