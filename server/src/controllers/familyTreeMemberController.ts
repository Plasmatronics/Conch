import { NextFunction, Request, Response } from "express";
import { FamilyTreeMember } from "../models";
import { handlerFactory } from "./controllerFactory";
import { AppError, catchError } from "../utils";
import { Types } from "mongoose";

const getFamilyTreeMember = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { id } = req.params;
		const { include } = req.query; // e.g. ?include=stories

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

		res.status(200).json({
			status: "success",
			data: member,
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

const getAllFamilyTreeMembers = handlerFactory.getAll(FamilyTreeMember);

export const familyTreeMemberController = {
	createFamilyTreeMember,
	getFamilyTreeMember,
	updateFamilyTreeMember,
	softDeleteFamilyTreeMember,
	cleanupAllDeletedFamilyTreeMembers,
	restoreFamilyTreeMember,
	restoreAllFamilyTreeMembers,
	getAllFamilyTreeMembers,
};
