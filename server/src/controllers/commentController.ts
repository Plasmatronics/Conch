import { Comment } from "../models";
import { handlerFactory } from "./controllerFactory";

const createComment = handlerFactory.createOne(Comment);

const getComment = handlerFactory.readOne(Comment);

const updateComment = handlerFactory.updateOne(Comment);

const softDeleteComment = handlerFactory.softDeleteOne(Comment);

const cleanupAllDeletedComments = handlerFactory.cleanupDeleted(Comment);

const restoreComment = handlerFactory.restoreOneSoftDeleted(Comment);

const restoreAllComments = handlerFactory.restoreSoftDeleted(Comment);

const getAllComments = handlerFactory.getAll(Comment);

export const commentController = {
	createComment,
	getComment,
	updateComment,
	softDeleteComment,
	cleanupAllDeletedComments,
	restoreComment,
	restoreAllComments,
	getAllComments,
};
