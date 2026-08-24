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
import { auth, verifySession } from "../middleware";

export const createPostRoutes = (dbPool: Pool): Router => {
	const postRouter = Router();

	//Get Member Posts
	postRouter.get(
		"/members/:memberId",
		verifySession(dbPool),
		auth("member"),
		getMemberPosts(dbPool),
	);

	//Nested Resource Operations
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

	//Resource Id Operarations
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

	//No Resource Id
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
		getAllPosts(dbPool),
	);

	return postRouter;
};
