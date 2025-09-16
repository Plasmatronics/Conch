import express from "express";
import { likeController } from "../controllers/likeController";
import { authController } from "../controllers";

const router = express.Router();

router.use(authController.protect);

router
	.route("/")
	.get(likeController.getManyLikes)
	.post(likeController.createLike);

router
	.route("/:id")
	.get(likeController.getLike)
	.patch(likeController.updateLike)
	.delete(likeController.deleteLike);

export { router as likeRouter };
