import express from "express";
import { familyTreeMemberController } from "../controllers/familyTreeMemberController";
import { authController } from "../controllers";

const router = express.Router();

router.use(authController.protect);

router
	.route("/trash")
	.patch(familyTreeMemberController.restoreAllFamilyTreeMembers)
	.delete(familyTreeMemberController.cleanupAllDeletedFamilyTreeMembers);

router
	.route("/trash/:id")
	.patch(familyTreeMemberController.restoreFamilyTreeMember);

router
	.route("/:id/stories")
	.get(familyTreeMemberController.getMemberStoriesAndComments);

router
	.route("/:id")
	.get(familyTreeMemberController.getFamilyTreeMember)
	.patch(familyTreeMemberController.updateFamilyTreeMember)
	.delete(familyTreeMemberController.softDeleteFamilyTreeMember);

router
	.route("/")
	.get(familyTreeMemberController.getManyFamilyTreeMembers)
	.post(familyTreeMemberController.createFamilyTreeMember);

export { router as familyTreeMemberRouter };
