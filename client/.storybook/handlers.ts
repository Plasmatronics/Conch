import { http, HttpResponse, delay } from "msw";
import {
	mockChildComment,
	mockFileUrl,
	mockMediaData,
	mockMediaPopulatedStoryData,
	mockMemberData,
	mockParentComment,
	userData,
} from "./mswData";
import { HydratedCommentDTO, HydratedUserDTO } from "@conch/shared";

export const handlers = [
	http.get(
		"http://127.0.0.1:3000/api/v1/familyTreeMembers*",
		async ({ request }) => {
			const url = new URL(request.url);

			const includeParam = url.searchParams.get("include");

			const data = { ...mockMemberData };
			if (includeParam === "stories") {
				data.stories = [mockMediaPopulatedStoryData];
			}

			//second and a half
			await delay(1500);

			return HttpResponse.json({
				status: "success",
				data,
			});
		},
	),

	http.get("http://127.0.0.1:3000/api/v1/media*", async () => {
		const data = { ...mockMediaData };

		//second and a half
		await delay(1500);

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
		await delay(1500);

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
		await delay(1500);

		return HttpResponse.json({
			status: "success",
			data,
		});
	}),

	http.post("http://127.0.0.1:3000/api/v1/comments*", async () => {
		//second and a half
		await delay(1500);

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

		//second and a half
		await delay(1500);

		return HttpResponse.json({
			status: "success",
			data: data,
		});
	}),

	http.post("http://127.0.0.1:3000/api/v1/files/download-url", async () => {
		//second and a half
		await delay(1500);

		return HttpResponse.json({
			status: "success",
			downloadUrl: mockFileUrl,
		});
	}),
];
