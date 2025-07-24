import express from "express";
import { documentController } from "../controllers/documentController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/:id")
	.get(documentController.getDocument)
	.patch(authController.protect, documentController.updateDocument)
	.delete(authController.protect, documentController.deleteDocument);

router.use(authController.protect);

router
	.route("/")
	.get(documentController.getAllDocuments)
	.post(documentController.createDocument);

export { router as documentRouter };
