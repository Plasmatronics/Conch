import { Like } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createLike = handlerFactory.createOne(Like);

export const getLike = handlerFactory.readOne(Like);

export const updateLike = handlerFactory.updateOne(Like);

export const deleteLike = handlerFactory.deleteOne(Like);

export const getAllLikes = handlerFactory.getAll(Like);
