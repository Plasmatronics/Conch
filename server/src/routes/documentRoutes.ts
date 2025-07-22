import express from "express";
import {
	createDocument,
	deleteDocument,
	getAllDocuments,
	getDocument,
	updateDocument,
} from "../controllers/documentController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllDocuments).post(createDocument);

router
	.route("/:id")
	.get(getDocument)
	.patch(updateDocument)
	.delete(deleteDocument);

export { router as documentRouter };
