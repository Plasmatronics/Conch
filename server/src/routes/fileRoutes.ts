import express from "express";
import { authController, s3Controller } from "../controllers";

const router = express.Router();

router.use(authController.protect);
router.post(
	"/generate-secure-download-url",
	s3Controller.generateSecureDownloadUrl,
);
router.post(
	"/generate-secure-upload-url",
	s3Controller.generateSecureUploadUrl,
);

export { router as fileRouter };
