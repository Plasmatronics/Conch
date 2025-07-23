import { Media } from "../models";
import { handlerFactory } from "./controllerFactory";

const createMedia = handlerFactory.createOne(Media);

const getMedia = handlerFactory.readOne(Media);

const updateMedia = handlerFactory.updateOne(Media);

const deleteMedia = handlerFactory.deleteOne(Media);

const getAllMedia = handlerFactory.getAll(Media);

export const mediaController = {
	createMedia,
	getMedia,
	updateMedia,
	deleteMedia,
	getAllMedia,
};
