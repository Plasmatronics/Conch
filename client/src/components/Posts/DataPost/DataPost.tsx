import { PersonId, StoryId } from "types";
import { useDataPost } from "./useDataPost";
import { BasePost, BasePostProps } from "../BasePost";
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
	const { dataQuery, avatarQuery, mediaQuery } = useDataPost({
		storyId,
		personId,
	});
	const isDataLoading =
		dataQuery.isLoading || avatarQuery.isLoading || mediaQuery.isLoading;

	const { name, relationToRootMember } =
		!isDataLoading && dataQuery.data && dataQuery.data.memberData;

	const { content, storyDate, title } =
		!isDataLoading && dataQuery.data && dataQuery.data.storyData;

	const renderedMedia: BasePostProps["media"] =
		mediaQuery.data &&
		mediaQuery.data.map((properties) => {
			return { src: properties.downloadUrl, type: properties.type };
		});

	return (
		<BasePost
			title={title}
			text={content}
			relationship={relationToRootMember}
			loading={isDataLoading}
			user={name}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
			avatar={avatarQuery.data && avatarQuery.data[0].downloadUrl}
			media={renderedMedia}
			year={new Date(storyDate)}
		/>
	);
};
