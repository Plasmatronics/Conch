import { NextFunction, Request, Response } from "express";
import { FamilyTreeMember } from "../models";
import { AppError, calculateRelation, catchError, RedisServer } from "../utils";

import { FamilyTreeMemberDoc, Relations, UserDoc } from "packages/shared";

export const initializeRelations = async (user: UserDoc) => {
	try {
		const redisClient = await RedisServer.getClient();
		const allMembers = await FamilyTreeMember.find({});

		const userFamilyTreeMemberDoc: FamilyTreeMemberDoc =
			await user.populate("familyTreeMember");

		const relations: Relations = {};
		for (const member of allMembers) {
			relations[member.id] = calculateRelation(userFamilyTreeMemberDoc, member);
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

export const getUserRelations = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;
		if (!user) {
			throw new AppError(401, "Could not verify account, please login again.");
		}

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

		res.status(201).json({
			status: "success",
			data: relations,
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const relationsController = {
	getUserRelations,
};
