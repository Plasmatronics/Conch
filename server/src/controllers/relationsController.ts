import { NextFunction, Request, Response } from "express";
import { FamilyTreeMember } from "../models";
import { AppError, calculateRelation, catchError, RedisServer } from "../utils";

import {
	PopulatedFamilyTreeMemberDTO,
	Relations,
	UserDoc,
} from "packages/shared";

export const initializeRelations = async (user: UserDoc) => {
	try {
		const redisClient = await RedisServer.getClient();
		const allMembers = await FamilyTreeMember.find({});

		const userFamilyTreeMemberDoc = await user.populate({
			path: "familyTreeMember",
			populate: [
				{ path: "parents", select: "name" },
				{ path: "children", select: "name" },
				{ path: "spouses", select: "name" },
				{ path: "dated", select: "name" },
			],
		});

		const relations: Relations = {};
		for (const member of allMembers) {
			relations[member.id] = calculateRelation(
				userFamilyTreeMemberDoc.familyTreeMember as unknown as PopulatedFamilyTreeMemberDTO,
				member as unknown as PopulatedFamilyTreeMemberDTO,
				allMembers as unknown as PopulatedFamilyTreeMemberDTO[],
			);
		}

		// store in redis under a user-specific key
		await redisClient.set(`relations:${user.id}`, JSON.stringify(relations));

		return relations;
	} catch (err) {
		throw new AppError(
			500,
			err instanceof Error ? err.message : "Could not initialize relations.",
		);
	}
};

export const getUserRelations = async (user: UserDoc) => {
	try {
		const redisClient = await RedisServer.getClient();
		const allMembers = await FamilyTreeMember.find({});

		const relationsJson = await redisClient.get(`relations:${user.id}`);
		let relations: Relations | undefined = relationsJson
			? JSON.parse(relationsJson)
			: undefined;
		const relationIds = relations ? Object.keys(relations) : [];

		if (!relations || relationIds.length !== allMembers.length) {
			relations = await initializeRelations(user);
		}

		return relations;
	} catch (err) {
		throw new AppError(
			500,
			err instanceof Error ? err.message : "Could not retrieve relations.",
		);
	}
};

const getUserRelationsHandler = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;
		if (!user) {
			throw new AppError(401, "Could not verify account, please login again.");
		}

		const relations = await getUserRelations(user);

		res.status(200).json({
			status: "success",
			data: relations,
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const relationsController = {
	getUserRelations: getUserRelationsHandler,
};
