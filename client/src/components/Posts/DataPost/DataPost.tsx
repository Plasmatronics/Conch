import { useDataPost } from "./useDataPost";
import { BasePost, BasePostProps } from "../BasePost";
import { useState } from "react";
import { HydratedStoryDTO, HydratedUserDTO } from "@conch/shared";

export interface DataPostProps {
	storyId: HydratedStoryDTO["id"];
	personId: HydratedUserDTO["id"];
}

export const DataPost = ({ storyId, personId }: DataPostProps) => {
	const [isLiked, setIsLiked] = useState(false);
	const { memberQuery, keyPhotoQuery, storyMediaQuery, storyContentData } =
		useDataPost({
			storyId,
			personId,
		});

	const isDataLoading =
		memberQuery.isLoading ||
		keyPhotoQuery.isLoading ||
		storyMediaQuery.isLoading;

	const { name = "", relationToRootMember = "" } = memberQuery.data ?? {};
	const { downloadUrl = "" } = keyPhotoQuery.data?.at(0) ?? {};

	const {
		storyDate = new Date(),
		title = "",
		content = "",
	} = storyContentData ?? {};
	const renderedMedia: BasePostProps["media"] =
		storyMediaQuery.data &&
		storyMediaQuery.data.map((properties) => {
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
			avatar={downloadUrl}
			media={renderedMedia}
			storyDate={storyDate}
		/>
	);
};
