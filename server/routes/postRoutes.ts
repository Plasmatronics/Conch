import { Router } from "express";
import { Pool } from "pg";
import {
	createPost,
	deletePost,
	getAllPosts,
	getPost,
	getMemberPosts,
	patchPost,
	addPostMembers,
	deletePostMembers,
	addPostMedia,
	deletePostMedia,
} from "../controller";
import { auth, queryParamParser, verifySession } from "../middleware";
import { postsQueryParamConfig } from "../schemas";

export const createPostRoutes = (dbPool: Pool): Router => {
	const postRouter = Router();

	postRouter.get(
		"/members/:memberId",
		verifySession(dbPool),
		auth("member"),
		queryParamParser(postsQueryParamConfig),
		getMemberPosts(dbPool),
	);

	postRouter.post(
		"/:postId/members",
		verifySession(dbPool),
		auth("member"),
		addPostMembers,
	);
	postRouter.post(
		"/:postId/members/:memberId/batchDelete",
		verifySession(dbPool),
		auth("member"),
		deletePostMembers,
	);
	postRouter.post(
		"/:postId/media",
		verifySession(dbPool),
		auth("member"),
		addPostMedia,
	);
	postRouter.post(
		"/:postId/media/:mediaId/batchDelete",
		verifySession(dbPool),
		auth("member"),
		deletePostMedia,
	);

	postRouter.get(
		"/:postId",
		verifySession(dbPool),
		auth("member"),
		getPost(dbPool),
	);

	postRouter.patch(
		"/:postId",
		verifySession(dbPool),
		auth("member"),
		patchPost(dbPool),
	);
	postRouter.delete(
		"/:postId",
		verifySession(dbPool),
		auth("admin"),
		deletePost(dbPool),
	);

	postRouter.post(
		"",
		verifySession(dbPool),
		auth("member"),
		createPost(dbPool),
	);
	postRouter.get(
		"",
		verifySession(dbPool),
		auth("member"),
		queryParamParser(postsQueryParamConfig),
		getAllPosts(dbPool),
	);

	return postRouter;
};
