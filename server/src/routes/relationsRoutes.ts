import express from "express";
import { authController, relationsController } from "../controllers";

const router = express.Router();

router.use(authController.protect);
router.get("/", relationsController.getUserRelations);

export { router as relationsRouter };
