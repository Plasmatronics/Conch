import express from "express";
import { mediaController } from "../controllers/mediaController";

const router = express.Router();
//read, update, delete
router
	.route("/")
	.get(mediaController.getAllMedia)
	.post(mediaController.createMedia);

router
	.route("/:id")
	.get(mediaController.getMedia)
	.patch(mediaController.updateMedia)
	.delete(mediaController.deleteMedia);

export { router as mediaRouter };
