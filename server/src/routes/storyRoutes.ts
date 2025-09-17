import express from "express";
import { storyController } from "../controllers/storyController";
import { authController } from "../controllers";

const router = express.Router();

router.use(authController.protect);

router
	.route("/trash")
	.patch(storyController.restoreAllStories)
	.delete(storyController.cleanupAllDeletedStories);

router.route("/trash/:id").patch(storyController.restoreStory);

router.route("/:id/comments").get(storyController.getStoryComments);

router
	.route("/:id")
	.get(storyController.getStory)
	.patch(storyController.updateStory)
	.delete(storyController.softDeleteStory);

router
	.route("/")
	.get(storyController.getManyStories)
	.post(storyController.createStory);

export { router as storyRouter };
