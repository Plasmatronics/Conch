import express from "express";
import { mediaController } from "../controllers/mediaController";
import { authController } from "../controllers";

const router = express.Router();
router
	.route("/:id")
	.get(mediaController.getMedia)
	.patch(authController.protect, mediaController.updateMedia)
	.delete(authController.protect, mediaController.deleteMedia);

router.use(authController.protect);

router
	.route("/")
	.get(mediaController.getAllMedia)
	.post(mediaController.createMedia);

export { router as mediaRouter };
