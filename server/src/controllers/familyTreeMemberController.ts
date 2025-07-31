import { FamilyTreeMember } from "../models";
import { handlerFactory } from "./controllerFactory";

const createFamilyTreeMember = handlerFactory.createOne(FamilyTreeMember);

const getFamilyTreeMember = handlerFactory.readOne(FamilyTreeMember);

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
