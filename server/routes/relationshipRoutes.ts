import { Router } from "express";
import { Pool } from "pg";
import { ConchFamilyCache } from "../cache";
import { auth, buildCacheEntry, verifySession } from "../middleware";
import {
	addRelationship,
	deleteRelationship,
	getAllRelationships,
	updateRelationship,
} from "../controller";

export const createRelationshipRoutes = (
	dbPool: Pool,
	cache: ConchFamilyCache,
): Router => {
	const relationshipRouter = Router();

	relationshipRouter.get(
		"/",
		verifySession(dbPool),
		auth("member"),
		getAllRelationships(dbPool),
	);

	relationshipRouter.post(
		"",
		verifySession(dbPool),
		auth("member"),
		addRelationship(dbPool),
		buildCacheEntry(cache),
	);

	relationshipRouter.patch(
		"/:relationshipId",
		verifySession(dbPool),
		auth("member"),
		updateRelationship(dbPool),
		buildCacheEntry(cache),
	);

	relationshipRouter.delete(
		"/:relationshipId",
		verifySession(dbPool),
		auth("member"),
		deleteRelationship(dbPool),
		buildCacheEntry(cache),
	);

	relationshipRouter.get(
		"/:relationshipId",
		verifySession(dbPool),
		auth("member"),
		deleteRelationship(dbPool),
	);

	return relationshipRouter;
};
