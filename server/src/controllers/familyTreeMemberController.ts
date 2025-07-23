import { FamilyTreeMember } from "../models";
import { handlerFactory } from "./controllerFactory";

const createFamilyTreeMember = handlerFactory.createOne(FamilyTreeMember);

const getFamilyTreeMember = handlerFactory.readOne(FamilyTreeMember);

const updateFamilyTreeMember = handlerFactory.updateOne(FamilyTreeMember);

const deleteFamilyTreeMember = handlerFactory.deleteOne(FamilyTreeMember);

const getAllFamilyTreeMembers = handlerFactory.getAll(FamilyTreeMember);

export const familyTreeMemberController = {
	createFamilyTreeMember,
	getFamilyTreeMember,
	updateFamilyTreeMember,
	deleteFamilyTreeMember,
	getAllFamilyTreeMembers,
};
