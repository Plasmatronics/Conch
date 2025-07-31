import express from "express";
import { documentController } from "../controllers/documentController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/:id")
	.get(documentController.getDocument)
	.patch(authController.protect, documentController.updateDocument)
	.delete(authController.protect, documentController.softDeleteDocument);

router.use(authController.protect);

router
	.route("/trash")
	.patch(documentController.restoreAllDocuments)
	.delete(documentController.cleanupAllDeletedDocuments);

router.route("/trash/:id").patch(documentController.restoreDocument);

router
	.route("/")
	.get(documentController.getAllDocuments)
	.post(documentController.createDocument);

export { router as documentRouter };
