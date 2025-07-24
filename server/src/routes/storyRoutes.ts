import express from "express";
import { storyController } from "../controllers/storyController";
import { authController } from "../controllers";

const router = express.Router();

router.use(authController.protect);

router
	.route("/")
	.get(storyController.getAllStories)
	.post(storyController.createStory);

router
	.route("/:id")
	.get(storyController.getStory)
	.patch(storyController.updateStory)
	.delete(storyController.deleteStory);

export { router as storyRouter };
