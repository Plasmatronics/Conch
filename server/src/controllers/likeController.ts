import { Like } from "../models";
import { handlerFactory } from "./controllerFactory";

const createLike = handlerFactory.createOne(Like);

const getLike = handlerFactory.readOne(Like);

const updateLike = handlerFactory.updateOne(Like);

const deleteLike = handlerFactory.deleteOne(Like);

const getAllLikes = handlerFactory.getAll(Like);

export const likeController = {
	createLike,
	getLike,
	updateLike,
	deleteLike,
	getAllLikes,
};
