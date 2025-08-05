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

router
	.route("/")
	.get(storyController.getAllStories)
	.post(storyController.createStory);

router
	.route("/:id")
	.get(storyController.getStory)
	.patch(storyController.updateStory)
	.delete(storyController.softDeleteStory);

export { router as storyRouter };
