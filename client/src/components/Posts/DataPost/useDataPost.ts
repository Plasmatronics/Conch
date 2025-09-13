import { DataPostProps } from "./DataPost";
import { useFetchMediaData, useFetchMemberData } from "../../../api";
import { HydratedStoryDTO } from "@conch/shared";

export const useDataPost = ({ storyId, personId }: DataPostProps) => {
	const { memberQuery, keyPhotoQuery } = useFetchMemberData({
		includeParamsValues: ["stories"],
		personId,
	});

	const storyContentData = memberQuery.data?.stories?.find(
		(story): story is HydratedStoryDTO => "id" in story && story.id === storyId,
	);

	const storyMediaQuery = useFetchMediaData({
		ids: storyContentData?.media ? storyContentData.media : [],
		enabled: !!storyContentData,
	});

	return { memberQuery, keyPhotoQuery, storyMediaQuery, storyContentData };
};
