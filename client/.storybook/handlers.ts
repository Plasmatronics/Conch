import { http, HttpResponse, delay } from "msw";
import {
	mockChildComment,
	mockFileUrl,
	mockMediaData,
	mockMediaPopulatedStoryData,
	mockMemberData,
	mockParentComment,
} from "./mswData";
import { HydratedCommentDTO, StoryDTOMediaPopulated } from "@conch/shared";

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

	http.get("http://127.0.0.1:3000/api/v1/stories/*", async ({ request }) => {
		const url = new URL(request.url);

		const data: StoryDTOMediaPopulated = { ...mockMediaPopulatedStoryData };

		if (url.pathname.endsWith("/comments")) {
			data.comments = mockParentComment;
			data.comments.replies = [mockChildComment];
		}

		//second and a half
		await delay(1500);

		return HttpResponse.json({
			status: "success",
			data: mockMediaPopulatedStoryData,
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
