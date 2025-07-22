import { Story } from "../models";
import { handlerFactory } from "./controllerFactory";

export const createStory = handlerFactory.createOne(Story);

export const getStory = handlerFactory.readOne(Story);

export const updateStory = handlerFactory.updateOne(Story);

export const deleteStory = handlerFactory.deleteOne(Story);

export const getAllStories = handlerFactory.getAll(Story);
