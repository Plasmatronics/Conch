import express from "express";
import { mediaController } from "../controllers/mediaController";
import { authController } from "../controllers";

const router = express.Router();
router
	.route("/:id")
	.get(mediaController.getMedia)
	.patch(authController.protect, mediaController.updateMedia)
	.delete(authController.protect, mediaController.softDeleteMedia);

router.use(authController.protect);

router
	.route("/trash")
	.patch(mediaController.restoreAllMedia)
	.delete(mediaController.cleanupAllDeletedMedia);

router.route("/trash/:id").patch(mediaController.restoreMedia);

router
	.route("/")
	.get(mediaController.getAllMedia)
	.post(mediaController.createMedia);

export { router as mediaRouter };
