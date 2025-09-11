import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataPostProps } from "./DataPost";
import { useFetchMediaData } from "../../../api/useFetchMediaData";

type useDataPostProps = Omit<DataPostProps, "isLiked" | "setIsLiked">;

const fetchPostData = async ({ storyId, personId }: useDataPostProps) => {
	const { data } = await axios.get(
		`http://127.0.0.1:3000/api/v1/familyTreeMembers/${personId}?include=stories`,
	);

	const memberData = data.data;
	const storyData = memberData.stories.find((val: any) => val.id === storyId);

	return { memberData, storyData };
};

export const useDataPost = ({ storyId, personId }: useDataPostProps) => {
	const dataQuery = useQuery({
		queryKey: [storyId, personId],
		queryFn: () => fetchPostData({ storyId, personId }),
	});

	const keyPhotoFileId = [dataQuery.data?.memberData?.keyPhoto];
	const mediaFileIds = dataQuery.data?.storyData?.media;

	const avatarQuery = useFetchMediaData(keyPhotoFileId);
	const mediaQuery = useFetchMediaData(mediaFileIds);

	return { dataQuery, avatarQuery, mediaQuery };
};
