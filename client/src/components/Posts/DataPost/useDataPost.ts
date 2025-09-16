import { HydratedStoryDTO, StoryDTOAuthorPopulated } from "@conch/shared";
import { useQuery } from "@tanstack/react-query";
import { useFetchMediaData } from "../../../api";
import axios from "axios";

const fetchDataPost = async (
	storyId: HydratedStoryDTO["id"],
): Promise<StoryDTOAuthorPopulated> => {
	try {
		const url = `http://127.0.0.1:3000/api/v1/stories/${storyId}`;
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

	const avatarFile = {
		fileKey: storyQuery?.data?.author?.keyPhoto?.fileKey ?? "",
		type: storyQuery?.data?.author?.keyPhoto?.type ?? "image",
	};

	const avatarQuery = useFetchMediaData({
		files: avatarFile ? [avatarFile] : [],
		enabled: storyQuery.isSuccess && !!avatarFile,
	});

	return { avatarQuery, storyQuery };
};
