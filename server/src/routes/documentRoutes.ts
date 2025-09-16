import express from "express";
import { documentController } from "../controllers/documentController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/trash")
	.patch(authController.protect, documentController.restoreAllDocuments)
	.delete(
		authController.protect,
		documentController.cleanupAllDeletedDocuments,
	);

router
	.route("/trash/:id")
	.patch(authController.protect, documentController.restoreDocument);

router
	.route("/:id")
	.get(documentController.getDocument)
	.patch(authController.protect, documentController.updateDocument)
	.delete(authController.protect, documentController.softDeleteDocument);

router
	.route("/")
	.get(documentController.getManyDocuments)
	.post(authController.protect, documentController.createDocument);

export { router as documentRouter };
