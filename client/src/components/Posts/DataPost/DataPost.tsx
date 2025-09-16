import { useDataPost } from "./useDataPost";
import { BasePost } from "../BasePost";
import { useState } from "react";
import {
	HydratedStoryDTO,
	HydratedFamilyTreeMemberDTO,
	StoryDTOAuthorPopulated,
} from "@conch/shared";
import { MediaItem } from "../PostGallery";

export interface DataPostProps {
	storyId: HydratedStoryDTO["id"];
	personId: HydratedFamilyTreeMemberDTO["id"];
}

export const DataPost = ({ storyId }: DataPostProps) => {
	const [isLiked, setIsLiked] = useState(false);
	const { storyQuery, avatarQuery } = useDataPost(storyId);

	const {
		author = {
			relationToRootMember: "",
			name: "",
		},
		title = "",
		storyDate = new Date(),
		content = "",
		media = [],
	} = (storyQuery?.data as StoryDTOAuthorPopulated) ?? {};

	const { downloadUrl: avatarImage } = avatarQuery?.data?.at?.(0) ?? {};

	const typeSafeMedia: MediaItem[] = media.map((mediaItem) => {
		return {
			type: mediaItem.type,
			src: mediaItem.downloadUrl,
		};
	});

	return (
		<BasePost
			title={title}
			text={content}
			relationship={author.relationToRootMember}
			loading={storyQuery.isLoading}
			user={author.name}
			isLiked={isLiked}
			media={typeSafeMedia}
			setIsLiked={setIsLiked}
			avatar={avatarImage}
			storyDate={storyDate}
		/>
	);
};
