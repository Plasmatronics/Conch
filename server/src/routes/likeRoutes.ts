import express from "express";
import { likeController } from "../controllers/likeController";

const router = express.Router();
//read, update, delete
router
	.route("/")
	.get(likeController.getAllLikes)
	.post(likeController.createLike);

router
	.route("/:id")
	.get(likeController.getLike)
	.patch(likeController.updateLike)
	.delete(likeController.deleteLike);

export { router as likeRouter };
