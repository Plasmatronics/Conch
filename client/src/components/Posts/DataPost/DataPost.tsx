import { PersonId, StoryId } from "types";
import { useDataPost } from "./useDataPost";
import { BasePost } from "../BasePost";
import { LikeCommentShareProps } from "../../Buttons";

export interface DataPostProps {
	storyId: StoryId;
	personId: PersonId;
	isLiked: LikeCommentShareProps["isLiked"];
	setIsLiked: LikeCommentShareProps["setIsLiked"];
}

export const DataPost = ({
	storyId,
	personId,
	isLiked,
	setIsLiked,
}: DataPostProps) => {
	const { dataQuery, imageQuery } = useDataPost({ storyId, personId });

	if (dataQuery.isLoading || imageQuery.isLoading) return null;
	if (dataQuery.isError || dataQuery.isError) return null;
	if (!dataQuery.data?.memberData || !dataQuery.data?.storyData) return null;

	const { name, relationToRootMember } = dataQuery && dataQuery.data.memberData;
	const { content, storyDate, title } = dataQuery && dataQuery.data.storyData;

	return (
		<BasePost
			title={title}
			text={content}
			relationship={relationToRootMember}
			loading={dataQuery.isPending && imageQuery.isPending}
			user={name}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
			avatar={imageQuery.data}
			year={new Date(storyDate)}
		/>
	);
};
