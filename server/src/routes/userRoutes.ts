import express from "express";
import { userController } from "../controllers/userController";

const router = express.Router();
//read, update, delete
router
	.route("/")
	.get(userController.getAllUsers)
	.post(userController.createUser);

router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

export { router as userRouter };
