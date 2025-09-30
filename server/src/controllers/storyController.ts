import { NextFunction, Request, Response } from "express";
import { Like, Story } from "../models";
import { handlerFactory } from "./controllerFactory";
import { AppError, catchError } from "../utils";
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

		if (id && !stories) {
			throw new AppError(404, "Could not find this document");
		}

		const currentUserId = req.user?.id;
		const storyArr = Array.isArray(stories) ? stories : [stories];
		let likedSet = new Set<string>();

		if (currentUserId) {
			const ids: string[] = [];

			storyArr.forEach((story) => {
				if (story) {
					ids.push(story.id.toString());

					for (const comment of story.comments as any[]) {
						if (comment && comment.id) ids.push(comment.id.toString());

						for (const reply of comment.replies)
							if (reply && reply.id) ids.push(reply.id.toString());
					}
				}
			});

			const likes = await Like.find({
				author: currentUserId,
				target: { $in: ids },
			}).select("target");

			likedSet = new Set(likes.map((like) => like.target.toString()));
		}

		if (storyArr) {
			storyArr.forEach((story) => {
				if (story) {
					if (likedSet.has(story.id)) {
						story.isLikedByUser = true;
					}

					if (story.comments) {
						for (const comment of story.comments || []) {
							(comment as any).isLikedByUser = likedSet.has(
								comment.id.toString(),
							);
							for (const reply of (comment as any).replies || []) {
								reply.isLikedByUser = likedSet.has(reply.id.toString());
							}
						}
					}
				}
			});
		}

		res.status(200).json({
			status: "success",
			data: id ? storyArr[0] : storyArr,
		});
	} catch (err) {
		console.log(err);
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
