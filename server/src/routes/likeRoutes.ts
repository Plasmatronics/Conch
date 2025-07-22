import express from "express";
import {
	createLike,
	deleteLike,
	getAllLikes,
	getLike,
	updateLike,
} from "../controllers/likeController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllLikes).post(createLike);

router.route("/:id").get(getLike).patch(updateLike).delete(deleteLike);

export { router as likeRouter };
