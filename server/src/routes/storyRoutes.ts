import express from "express";
import {
	createStory,
	deleteStory,
	getAllStories,
	getStory,
	updateStory,
} from "../controllers/storyController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllStories).post(createStory);

router.route("/:id").get(getStory).patch(updateStory).delete(deleteStory);

export { router as storyRouter };
