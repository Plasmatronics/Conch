import { Router } from "express";
import { Pool } from "pg";
import {
	createPost,
	deletePost,
	getAllPosts,
	getPost,
	getMemberPosts,
	mediaControllers,
	membersControllers,
	patchPost,
} from "../controller";
import { auth, verifySession } from "../middleware";

export const createPostRoutes = (dbPool: Pool): Router => {
	const postRouter = Router();

	const { delete: deleteMedia, post: postMedia } = mediaControllers(dbPool);
	const { delete: deleteMember, post: postMember } = membersControllers(dbPool);

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
		postMember,
	);
	postRouter.delete(
		"/:postId/members/:memberId",
		verifySession(dbPool),
		auth("member"),
		deleteMember,
	);
	postRouter.post(
		"/:postId/media",
		verifySession(dbPool),
		auth("member"),
		postMedia,
	);
	postRouter.delete(
		"/:postId/media/:mediaId",
		verifySession(dbPool),
		auth("member"),
		deleteMedia,
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
