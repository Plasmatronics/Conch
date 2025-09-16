import { User } from "../models";
import { handlerFactory } from "./controllerFactory";

const createUser = handlerFactory.createOne(User);

const getUser = handlerFactory.readOne(User);

const updateUser = handlerFactory.updateOne(User);

const softDeleteUser = handlerFactory.softDeleteOne(User);

const cleanupAllDeletedUsers = handlerFactory.cleanupDeleted(User);

const restoreUser = handlerFactory.restoreOneSoftDeleted(User);

const restoreAllUsers = handlerFactory.restoreSoftDeleted(User);

const getManyUsers = handlerFactory.getMany(User);

export const userController = {
	createUser,
	getUser,
	updateUser,
	softDeleteUser,
	cleanupAllDeletedUsers,
	restoreUser,
	restoreAllUsers,
	getManyUsers,
};
