import express from "express";
import { familyTreeMemberController } from "../controllers/familyTreeMemberController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/:id")
	.get(familyTreeMemberController.getFamilyTreeMember)
	.patch(
		authController.protect,
		familyTreeMemberController.updateFamilyTreeMember,
	)
	.delete(
		authController.protect,
		familyTreeMemberController.deleteFamilyTreeMember,
	);

router.use(authController.protect);

router
	.route("/")
	.get(familyTreeMemberController.getAllFamilyTreeMembers)
	.post(familyTreeMemberController.createFamilyTreeMember);

export { router as familyTreeMemberRouter };
