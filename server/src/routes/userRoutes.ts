import express from "express";
import {
	createUser,
	deleteUser,
	getAllUsers,
	getUser,
	updateUser,
} from "../controllers/userController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export { router as userRouter };
