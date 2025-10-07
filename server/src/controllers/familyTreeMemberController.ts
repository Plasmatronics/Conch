import { NextFunction, Request, Response } from "express";
import { FamilyTreeMember, Story } from "../models";
import { handlerFactory } from "./controllerFactory";
import {
	AppError,
	catchError,
	hasUserLikedStoryOrComments,
	QueryBuilder,
} from "../utils";
import { Types } from "mongoose";
import { StoryDoc } from "packages/shared/src";

const getFamilyTreeMember = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { id } = req.params;
		const { include, count } = req.query; // e.g. ?include=stories

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		let query = FamilyTreeMember.findById(id);

		if (include && include.toString().split(",").includes("stories")) {
			query = query.populate({
				path: "stories",
				match: { deletedAt: { $exists: false } },
				select: "-__v",
			});
		}

		const member = await query;

		if (!member) {
			throw new AppError(404, "Could not find this document");
		}

		let storiesCount: number | undefined;
		if (count && count.toString().split(",").includes("stories")) {
			storiesCount = await Story.countDocuments({
				involves: id,
				deletedAt: { $exists: false },
			});
		}

		res.status(200).json({
			status: "success",
			data: member,
			...(storiesCount !== undefined ? { storiesCount } : {}),
		});
	} catch (err) {
		catchError(err, next);
	}
};

const getMemberStoriesAndComments = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { id } = req.params;

		if (!Types.ObjectId.isValid(id)) {
			throw new AppError(400, "Invalid ID format");
		}

		const memberWithStories = await FamilyTreeMember.findById(id)
			.populate({
				path: "stories",
				match: { deletedAt: { $exists: false } },
				populate: {
					path: "comments",
					select: "content author likes createdAt",
					match: { deletedAt: { $exists: false } },
					populate: {
						path: "replies",
						match: { deletedAt: { $exists: false } },
						select: "-__v",
						options: { sort: { createdAt: 1 } },
					},
				},
			})
			.sort("-likes");

		const stories = (memberWithStories?.stories || []) as StoryDoc[];

		const currentUserId = req.user?.id;
		const data = await hasUserLikedStoryOrComments(stories, currentUserId);

		res.status(200).json({
			status: "success",
			numStories: stories.length || 0,
			data,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const getManyFamilyTreeMembers = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { count } = req.query;

		const memberQuery = new QueryBuilder(FamilyTreeMember.find(), req.query)
			.filter()
			.paginate()
			.sort()
			.populate()
			.limitFields();

		let members = await memberQuery.query;

		if (count && count.toString().split(",").includes("stories")) {
			const ids = members.map((doc) => doc._id);

			const counts = await Story.aggregate([
				{ $match: { involves: { $in: ids }, deletedAt: { $exists: false } } },
				{ $unwind: "$involves" },
				{ $group: { _id: "$involves", storiesCount: { $sum: 1 } } },
			]);

			const countMap = counts.reduce(
				(acc, cur) => {
					acc[cur._id.toString()] = cur.storiesCount;
					return acc;
				},
				{} as Record<string, number>,
			);

			members = members.map((doc: any) => ({
				...doc.toObject(),
				storiesCount: countMap[doc._id.toString()] || 0,
				stories: undefined,
			}));
		}

		res.status(200).json({
			status: "success",
			length: members.length,
			data: members,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const createFamilyTreeMember = handlerFactory.createOne(FamilyTreeMember);

const updateFamilyTreeMember = handlerFactory.updateOne(FamilyTreeMember);

const softDeleteFamilyTreeMember =
	handlerFactory.softDeleteOne(FamilyTreeMember);

const cleanupAllDeletedFamilyTreeMembers =
	handlerFactory.cleanupDeleted(FamilyTreeMember);

const restoreFamilyTreeMember =
	handlerFactory.restoreOneSoftDeleted(FamilyTreeMember);

const restoreAllFamilyTreeMembers =
	handlerFactory.restoreSoftDeleted(FamilyTreeMember);

export const familyTreeMemberController = {
	createFamilyTreeMember,
	getFamilyTreeMember,
	updateFamilyTreeMember,
	softDeleteFamilyTreeMember,
	cleanupAllDeletedFamilyTreeMembers,
	restoreFamilyTreeMember,
	restoreAllFamilyTreeMembers,
	getManyFamilyTreeMembers,
	getMemberStoriesAndComments,
};
