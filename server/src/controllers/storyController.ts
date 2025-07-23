import { Story } from "../models";
import { handlerFactory } from "./controllerFactory";

const createStory = handlerFactory.createOne(Story);

const getStory = handlerFactory.readOne(Story);

const updateStory = handlerFactory.updateOne(Story);

const deleteStory = handlerFactory.deleteOne(Story);

const getAllStories = handlerFactory.getAll(Story);

export const storyController = {
	createStory,
	getStory,
	updateStory,
	deleteStory,
	getAllStories,
};
