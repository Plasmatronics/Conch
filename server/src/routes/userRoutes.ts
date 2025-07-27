import express from "express";
import { authController, userController } from "../controllers";

const router = express.Router();

router.route("/login").post(authController.login);

router.route("/signup").post(authController.signup);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").post(authController.resetPassword);

router.use(authController.protect);

router.route("/logout").get(authController.logout);

router.route("/").get(userController.getAllUsers);
router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

export { router as userRouter };
