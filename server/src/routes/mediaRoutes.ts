import express from "express";
import {
	createMedia,
	deleteMedia,
	getAllMedia,
	getMedia,
	updateMedia,
} from "../controllers/mediaController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllMedia).post(createMedia);

router.route("/:id").get(getMedia).patch(updateMedia).delete(deleteMedia);

export { router as mediaRouter };
