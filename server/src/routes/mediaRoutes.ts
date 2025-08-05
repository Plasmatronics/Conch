import express from "express";
import { mediaController } from "../controllers/mediaController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/trash")
	.patch(authController.protect, mediaController.restoreAllMedia)
	.delete(authController.protect, mediaController.cleanupAllDeletedMedia);

router
	.route("/trash/:id")
	.patch(authController.protect, mediaController.restoreMedia);

router
	.route("/:id")
	.get(mediaController.getMedia)
	.patch(authController.protect, mediaController.updateMedia)
	.delete(authController.protect, mediaController.softDeleteMedia);

router
	.route("/")
	.get(mediaController.getAllMedia)
	.post(authController.protect, mediaController.createMedia);

export { router as mediaRouter };
