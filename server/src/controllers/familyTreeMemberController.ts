import { FamilyTreeMember } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createFamilyTreeMember =
	handlerFactory.createOne(FamilyTreeMember);

export const getFamilyTreeMember = handlerFactory.readOne(FamilyTreeMember);

export const updateFamilyTreeMember =
	handlerFactory.updateOne(FamilyTreeMember);

export const deleteFamilyTreeMember =
	handlerFactory.deleteOne(FamilyTreeMember);

export const getAllFamilyTreeMembers = handlerFactory.getAll(FamilyTreeMember);
