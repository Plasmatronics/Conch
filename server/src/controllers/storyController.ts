import { Story } from "../models";
import { handlerFactory } from "./controllerFactory";

const createStory = handlerFactory.createOne(Story);

const getStory = handlerFactory.readOne(Story);

const updateStory = handlerFactory.updateOne(Story);

const softDeleteStory = handlerFactory.softDeleteOne(Story);

const cleanupAllDeletedStories = handlerFactory.cleanupDeleted(Story);

const restoreStory = handlerFactory.restoreOneSoftDeleted(Story);

const restoreAllStories = handlerFactory.restoreSoftDeleted(Story);

const getManyStories = handlerFactory.getMany(Story);

export const storyController = {
	createStory,
	getStory,
	updateStory,
	softDeleteStory,
	cleanupAllDeletedStories,
	restoreStory,
	restoreAllStories,
	getManyStories,
};
