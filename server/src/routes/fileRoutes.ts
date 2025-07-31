import express from "express";
import { authController, s3Controller } from "../controllers";

const router = express.Router();

router.use(authController.protect);
router.post("/download-url", s3Controller.generateSecureDownloadUrl);
router.post("/upload-url", s3Controller.generateSecureUploadUrl);

export { router as fileRouter };
