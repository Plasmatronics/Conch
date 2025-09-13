import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataCommentProps } from "./DataComment";
import { useFetchMediaData } from "../../../api/useFetchMediaData";

const fetchCommentData = async ({ commentId, personId }: DataCommentProps) => {
	const { data } = await axios.get(
		`http://127.0.0.1:3000/api/v1/familyTreeMembers/${personId}?include=stories`,
	);

	const memberData = data.data;
	const storyData = memberData.stories.find((val: any) => val.id === commentId);

	return { memberData, storyData };
};

export const useDataComment = ({ commentId, personId }: DataCommentProps) => {
	const dataQuery = useQuery({
		queryKey: [commentId, personId],
		queryFn: () => fetchCommentData({ commentId, personId }),
	});

	const keyPhotoFileId = [dataQuery.data?.memberData?.keyPhoto];
	const mediaFileIds = dataQuery.data?.storyData?.media;

	const avatarQuery = useFetchMediaData(keyPhotoFileId);
	const mediaQuery = useFetchMediaData(mediaFileIds);

	return { dataQuery, avatarQuery, mediaQuery };
};
