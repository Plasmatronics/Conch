import express from "express";
import { documentController } from "../controllers/documentController";

const router = express.Router();
//read, update, delete
router
	.route("/")
	.get(documentController.getAllDocuments)
	.post(documentController.createDocument);

router
	.route("/:id")
	.get(documentController.getDocument)
	.patch(documentController.updateDocument)
	.delete(documentController.deleteDocument);

export { router as documentRouter };
