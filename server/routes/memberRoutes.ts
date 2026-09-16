import { Router } from "express";
import { Pool } from "pg";
import { membersControllers } from "../controller";
import { ConchFamilyCache } from "../cache";
import { auth, verifySession, buildCacheEntry } from "../middleware";

export const createMemberRoutes = (
	dbPool: Pool,
	cache: ConchFamilyCache,
): Router => {
	const membersRouter = Router();
	const {
		getAll: getAllMembers,
		get: getMember,
		patch: patchMember,
		post: postMember,
		delete: deleteMember,
	} = membersControllers(dbPool);

	membersRouter.get("", verifySession(dbPool), auth("member"), getAllMembers);

	membersRouter.post(
		"",
		verifySession(dbPool),
		auth("admin"),
		postMember,
		buildCacheEntry(cache),
	);

	membersRouter.patch(
		"/:memberId",
		verifySession(dbPool),
		auth("member"),
		patchMember,
	);

	membersRouter.delete(
		"/:memberId",
		verifySession(dbPool),
		auth("admin"),
		deleteMember,
		buildCacheEntry(cache),
	);

	membersRouter.get(
		"/:memberId",
		verifySession(dbPool),
		auth("member"),
		getMember,
	);

	return membersRouter;
};
