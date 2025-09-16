import { HydratedStoryDTO, StoryDTOAuthorPopulated } from "@conch/shared";
import { useQuery } from "@tanstack/react-query";
import { useFetchMediaData } from "../../../api";
import axios, { AxiosError } from "axios";

const fetchDataPost = async (
	storyId: HydratedStoryDTO["id"],
): Promise<StoryDTOAuthorPopulated> => {
	try {
		const url = `http://127.0.0.1:3000/api/v1/stories/${storyId}`;
		const { data } = await axios.get<{
			data: StoryDTOAuthorPopulated;
		}>(url);

		return data.data;
	} catch (err: unknown) {
		throw new Error(
			(err as AxiosError).message || "Failed to fetch story data",
		);
	}
};

export const useDataPost = (storyId: HydratedStoryDTO["id"]) => {
	const storyQuery = useQuery<StoryDTOAuthorPopulated | Error>({
		queryKey: ["story", storyId],
		queryFn: () => fetchDataPost(storyId),
	});

	const memberAvatarData = {
		fileKey:
			storyQuery?.data instanceof Error
				? ""
				: (storyQuery?.data?.author?.keyPhoto?.fileKey ?? ""),
		type:
			storyQuery?.data instanceof Error
				? "image"
				: (storyQuery?.data?.author?.keyPhoto?.type ?? "image"),
	};

	const avatarQuery = useFetchMediaData({
		files: [memberAvatarData],
		enabled: !!(storyQuery?.data as StoryDTOAuthorPopulated).author.keyPhoto,
	});

	return { avatarQuery, storyQuery };
};
