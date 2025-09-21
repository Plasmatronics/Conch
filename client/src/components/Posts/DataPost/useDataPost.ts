import {
	HydratedStoryDTO,
	MediaTypeAndKey,
	StoryDTOAuthorPopulated,
} from "@conch/shared";
import { useQuery } from "@tanstack/react-query";
import { useFetchMediaData } from "../../../api";
import axios from "axios";

const fetchDataPost = async (
	storyId: HydratedStoryDTO["id"],
): Promise<StoryDTOAuthorPopulated> => {
	try {
		const url = `http://127.0.0.1:3000/api/v1/stories/${storyId}/comments`;
		const { data } = await axios.get<{
			data: StoryDTOAuthorPopulated;
		}>(url);

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useDataPost = (storyId: HydratedStoryDTO["id"]) => {
	const storyQuery = useQuery<StoryDTOAuthorPopulated>({
		queryKey: ["story", storyId],
		queryFn: () => fetchDataPost(storyId),
	});

	const imgFiles: MediaTypeAndKey[] = [
		{
			fileKey: storyQuery?.data?.author?.keyPhoto?.fileKey ?? "",
			type: storyQuery?.data?.author?.keyPhoto?.type ?? "image",
		},
	];

	storyQuery?.data?.comments?.map((comment) => {
		imgFiles.push({
			fileKey: comment.author.keyPhoto.fileKey,
			type: comment.author.keyPhoto.type,
		});
	});

	const avatarQuery = useFetchMediaData({
		files: imgFiles ? imgFiles : [],
		enabled: storyQuery.isSuccess && !!imgFiles,
	});

	return { avatarQuery, storyQuery };
};
