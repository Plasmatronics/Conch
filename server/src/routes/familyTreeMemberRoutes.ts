import express from "express";
import { familyTreeMemberController } from "../controllers/familyTreeMemberController";

const router = express.Router();
//read, update, delete
router
	.route("/")
	.get(familyTreeMemberController.getAllFamilyTreeMembers)
	.post(familyTreeMemberController.createFamilyTreeMember);

router
	.route("/:id")
	.get(familyTreeMemberController.getFamilyTreeMember)
	.patch(familyTreeMemberController.updateFamilyTreeMember)
	.delete(familyTreeMemberController.deleteFamilyTreeMember);

export { router as familyTreeMemberRouter };
