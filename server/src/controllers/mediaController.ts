import { Media } from "../models";
import { handlerFactory } from "./controllerFactory";

const createMedia = handlerFactory.createOne(Media);

const getMedia = handlerFactory.readOne(Media);

const updateMedia = handlerFactory.updateOne(Media);

const softDeleteMedia = handlerFactory.softDeleteOne(Media);

const cleanupAllDeletedMedia = handlerFactory.cleanupDeleted(Media);

const restoreMedia = handlerFactory.restoreOneSoftDeleted(Media);

const restoreAllMedia = handlerFactory.restoreSoftDeleted(Media);

const getManyMedia = handlerFactory.getMany(Media);

export const mediaController = {
	createMedia,
	getMedia,
	updateMedia,
	softDeleteMedia,
	cleanupAllDeletedMedia,
	restoreMedia,
	restoreAllMedia,
	getManyMedia,
};
