import express from "express";
import { commentController } from "../controllers/commentController";
import { authController } from "../controllers";

const router = express.Router();

router.use(authController.protect);

router
	.route("/trash")
	.patch(commentController.restoreAllComments)
	.delete(commentController.cleanupAllDeletedComments);

router.route("/trash/:id").patch(commentController.restoreComment);

router
	.route("/:id")
	.get(commentController.getComment)
	.patch(commentController.updateComment)
	.delete(commentController.softDeleteComment);

router
	.route("/")
	.get(commentController.getManyComments)
	.post(commentController.createComment);

export { router as commentRouter };
