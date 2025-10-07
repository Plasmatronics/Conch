import { http, HttpResponse, delay } from "msw";
import { v4 as uuidv4 } from "uuid";
import {
	memberAndStoriesAndCommentsData,
	mockAllMembers,
	mockChildComment,
	mockFileUrl,
	mockMediaData,
	mockMediaPopulatedStoryData,
	mockMemberData,
	mockParentComment,
	userData,
} from "./mswData";
import {
	HydratedCommentDTO,
	HydratedLikeDTO,
	HydratedUserDTO,
} from "@conch/shared";

const storyLikes: Record<string, HydratedLikeDTO[]> = {};
const commentLikes: Record<string, HydratedLikeDTO[]> = {};

export const handlers = [
	http.get(
		"http://127.0.0.1:3000/api/v1/familyTreeMembers*",
		async ({ request }) => {
			const url = new URL(request.url);

			const pathParts = url.pathname.split("/").filter(Boolean); // ["api", "v1", "familyTreeMembers"] or ["api","v1","familyTreeMembers","<id>"]
			const isGetAll = pathParts.length === 3; // no id in path

			const includeParam = url.searchParams.get("include");
			const relationParam = url.searchParams.get("relationToRootMember[ne]");
			const countParam = url.searchParams.get("count");

			let data;
			let numStories;

			if (isGetAll) {
				data = [...mockAllMembers];

				if (relationParam) {
					data = data.filter(
						(member) => member.relationToRootMember !== relationParam,
					);
				}

				if (countParam === "stories") {
					data = data.map((member) => ({
						...member,
						storiesCount: member.storiesCount || 0,
						stories: undefined,
					}));
				}
				if (includeParam === "stories" && data) {
					data = data.map((member) => ({
						...member,
						stories: [mockMediaPopulatedStoryData],
					}));
				}
			} else if (pathParts[4] === "stories") {
				//means we are requesting all stories and comments attached to a member
				data = memberAndStoriesAndCommentsData;
				numStories = memberAndStoriesAndCommentsData.stories.length;
			} else {
				const id = pathParts[3];
				data = mockAllMembers.find((member) => member.id === id) || null;

				if (includeParam === "stories" && data) {
					data.stories = [mockMediaPopulatedStoryData];
				}

				if (countParam === "stories" && data) {
					data.storiesCount = data.storiesCount || 0;
					data.stories = undefined;
				}
			}

			// simulate delay
			await delay(500);

			return HttpResponse.json({
				status: "success",
				length: Array.isArray(data) ? data.length : undefined,
				numStories: pathParts[4] === "stories" ? numStories : undefined,
				data,
			});
		},
	),

	http.get("http://127.0.0.1:3000/api/v1/media*", async () => {
		const data = { ...mockMediaData };

		//second and a half
		await delay(500);

		return HttpResponse.json({
			status: "success",
			data,
		});
	}),

	http.get("http://127.0.0.1:3000/api/v1/users*", async ({ request }) => {
		const url = new URL(request.url);

		const includeParam = url.searchParams.get("include");

		const data: HydratedUserDTO = { ...userData };
		if (includeParam === "member") {
			data.familyTreeMember = mockMemberData;
		}

		//second and a half
		await delay(500);

		return HttpResponse.json({
			status: "success",
			data,
		});
	}),

	http.get("http://127.0.0.1:3000/api/v1/comments*", async ({ request }) => {
		const url = new URL(request.url);

		const includeParam = url.searchParams.get("include");

		const data: HydratedCommentDTO = { ...mockParentComment };
		if (includeParam === "replies") {
			data.replies = [mockChildComment];
		}

		//second and a half
		await delay(500);

		return HttpResponse.json({
			status: "success",
			data,
		});
	}),

	http.get("http://127.0.0.1:3000/api/v1/likes*", async ({ request }) => {
		const url = new URL(request.url);
		const target = url.searchParams.get("target");
		const author = url.searchParams.get("author");

		if (!target || !author) {
			return HttpResponse.json(
				{ status: "error", data: null },
				{ status: 400 },
			);
		}

		const likes = [
			...(storyLikes[target] || []),
			...(commentLikes[target] || []),
		].filter((like) => like.author === author);

		await delay(500);

		return HttpResponse.json({
			status: "success",
			data: likes[0] || null,
		});
	}),

	http.post("http://127.0.0.1:3000/api/v1/likes*", async ({ request }) => {
		const body: HydratedLikeDTO = await request.json();
		const { target, targetType, author } = body;

		const likesArray =
			targetType === "Story"
				? (storyLikes[target] ?? [])
				: (commentLikes[target] ?? []);

		// Check if author already liked
		const existing = likesArray.find((l) => l.author === author);
		if (existing) {
			return HttpResponse.json({ status: "success", data: existing });
		}

		const newLike: HydratedLikeDTO = {
			_id: uuidv4(),
			id: uuidv4(),
			target,
			targetType,
			author,
			createdAt: new Date().toISOString(),
			__v: 0,
		};

		if (targetType === "Story") {
			if (!storyLikes[target]) storyLikes[target] = [];
			storyLikes[target].push(newLike);
		} else if (targetType === "Comment") {
			if (!commentLikes[target]) commentLikes[target] = [];
			commentLikes[target].push(newLike);
		}

		await delay(500);

		return HttpResponse.json({ status: "success", data: newLike });
	}),

	http.delete("http://127.0.0.1:3000/api/v1/likes*", async ({ request }) => {
		const url = new URL(request.url);
		const targetId = url.searchParams.get("target");

		if (!targetId) {
			return HttpResponse.json({ status: "error" }, { status: 400 });
		}

		Object.keys(storyLikes).forEach((storyId) => {
			storyLikes[storyId] = storyLikes[storyId].filter(
				(l) => l.id !== targetId,
			);
		});

		Object.keys(commentLikes).forEach((commentId) => {
			commentLikes[commentId] = commentLikes[commentId].filter(
				(l) => l.id !== targetId,
			);
		});

		await delay(500);

		return HttpResponse.json({
			status: "success",
			data: { id: targetId },
		});
	}),

	http.post("http://127.0.0.1:3000/api/v1/comments*", async () => {
		//second and a half
		await delay(500);

		return HttpResponse.json({
			status: "success",
			data: {
				content: "Great story!!!!!!",
				author: "64f1586f28c96e3d47b4d0e3",
				target: "68911e71d4d0d606ca7b735e",
				createdAt: "2025-09-22T19:30:56.639Z",
				_id: "68d1a43465d375cc4a7d32d0",
				__v: 0,
				id: "68d1a43465d375cc4a7d32d0",
			},
		});
	}),

	http.get("http://127.0.0.1:3000/api/v1/stories/*", async ({ request }) => {
		const url = new URL(request.url);
		const data = { ...mockMediaPopulatedStoryData };
		const comments = { ...mockParentComment };
		comments.replies = [mockChildComment];

		if (url.pathname.endsWith("/comments")) {
			data.comments = [comments];
		}

		data.likes = storyLikes[data.id]?.length || data.likes;
		data.comments?.forEach((comment: HydratedCommentDTO) => {
			comment.likes = commentLikes[comment.id]?.length || comment.likes;
			comment.replies?.forEach((reply: HydratedCommentDTO) => {
				reply.likes = commentLikes[reply.id]?.length || reply.likes;
			});
		});

		await delay(500);
		return HttpResponse.json({ status: "success", data });
	}),

	http.post("http://127.0.0.1:3000/api/v1/files/download-url", async () => {
		//second and a half
		await delay(500);

		return HttpResponse.json({
			status: "success",
			downloadUrl: mockFileUrl,
		});
	}),
];
