import { User } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createUser = handlerFactory.createOne(User);

export const getUser = handlerFactory.readOne(User);

export const updateUser = handlerFactory.updateOne(User);

export const deleteUser = handlerFactory.deleteOne(User);

export const getAllUsers = handlerFactory.getAll(User);
