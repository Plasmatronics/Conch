import { Media } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createMedia = handlerFactory.createOne(Media);

export const getMedia = handlerFactory.readOne(Media);

export const updateMedia = handlerFactory.updateOne(Media);

export const deleteMedia = handlerFactory.deleteOne(Media);

export const getAllMedia = handlerFactory.getAll(Media);
