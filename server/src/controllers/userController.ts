import { User } from "../models";
import { handlerFactory } from "./controllerFactory";

const createUser = handlerFactory.createOne(User);

const getUser = handlerFactory.readOne(User);

const updateUser = handlerFactory.updateOne(User);

const deleteUser = handlerFactory.deleteOne(User);

const getAllUsers = handlerFactory.getAll(User);

export const userController = {
	createUser,
	getUser,
	updateUser,
	deleteUser,
	getAllUsers,
};
