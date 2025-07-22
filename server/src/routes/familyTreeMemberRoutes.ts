import express from "express";
import {
	createFamilyTreeMember,
	deleteFamilyTreeMember,
	getAllFamilyTreeMembers,
	getFamilyTreeMember,
	updateFamilyTreeMember,
} from "../controllers/familyTreeMemberController";

const router = express.Router();
//read, update, delete
router.route("/").get(getAllFamilyTreeMembers).post(createFamilyTreeMember);

router
	.route("/:id")
	.get(getFamilyTreeMember)
	.patch(updateFamilyTreeMember)
	.delete(deleteFamilyTreeMember);

export { router as familyTreeMemberRouter };
