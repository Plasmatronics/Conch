import { http, HttpResponse, delay } from "msw";
import {
	CommentResponse,
	CommentWithReplies,
	MemberResponse,
	MemberWithStories,
	mockChildComment,
	mockFileUrl,
	mockMediaData,
	mockMemberData,
	mockParentComment,
	mockStoriesData,
} from "./mswData";

export const handlers = [
	http.get(
		"http://127.0.0.1:3000/api/v1/familyTreeMembers*",
		async ({ request }) => {
			const url = new URL(request.url);

			const includeParam = url.searchParams.get("include");

			const data: MemberResponse = { ...mockMemberData };
			if (includeParam === "stories") {
				(data as MemberWithStories).stories = mockStoriesData;
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

	http.get("http://127.0.0.1:3000/api/v1/comments*", async ({ request }) => {
		const url = new URL(request.url);

		const includeParam = url.searchParams.get("include");

		const data: CommentResponse = { ...mockParentComment };
		if (includeParam === "replies") {
			(data as CommentWithReplies).replies = [mockChildComment];
		}

		//second and a half
		await delay(1500);

		return HttpResponse.json({
			status: "success",
			data,
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
