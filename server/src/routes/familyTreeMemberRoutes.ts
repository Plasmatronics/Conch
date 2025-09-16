import express from "express";
import { familyTreeMemberController } from "../controllers/familyTreeMemberController";
import { authController } from "../controllers";

const router = express.Router();

router
	.route("/trash")
	.patch(
		authController.protect,
		familyTreeMemberController.restoreAllFamilyTreeMembers,
	)
	.delete(
		authController.protect,
		familyTreeMemberController.cleanupAllDeletedFamilyTreeMembers,
	);

router
	.route("/trash/:id")
	.patch(
		authController.protect,
		familyTreeMemberController.restoreFamilyTreeMember,
	);

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

router
	.route("/")
	.get(familyTreeMemberController.getManyFamilyTreeMembers)
	.post(
		authController.protect,
		familyTreeMemberController.createFamilyTreeMember,
	);

export { router as familyTreeMemberRouter };
