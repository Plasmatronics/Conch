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
		familyTreeMemberController.softDeleteFamilyTreeMember,
	);

router.use(authController.protect);

router
	.route("/trash")
	.patch(familyTreeMemberController.restoreAllFamilyTreeMembers)
	.delete(familyTreeMemberController.cleanupAllDeletedFamilyTreeMembers);

router
	.route("/trash/:id")
	.patch(familyTreeMemberController.restoreFamilyTreeMember);

router
	.route("/")
	.get(familyTreeMemberController.getAllFamilyTreeMembers)
	.post(familyTreeMemberController.createFamilyTreeMember);

export { router as familyTreeMemberRouter };
