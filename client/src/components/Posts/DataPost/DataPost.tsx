import { useDataPost } from "./useDataPost";
import { BasePost } from "../BasePost";
import React from "react";
import { HydratedStoryDTO } from "@conch/shared";
import { CommentSectionProps, IReply } from "../../Comments";

export interface DataPostProps {
	storyId: HydratedStoryDTO["id"];
}

export const DataPost = ({ storyId }: DataPostProps) => {
	const [isLiked, setIsLiked] = React.useState(false);
	const { storyQuery, avatarQuery } = useDataPost(storyId);
	const isLoading = storyQuery.isLoading || avatarQuery.isLoading;

	const {
		author = {
			name: "",
			relationToRootMember: "",
			keyPhoto: {
				fileKey: "",
				type: "image",
			},
		},
		title = "",
		storyDate = new Date(),
		content = "",
		media = [],
		likes = 0,
		comments,
	} = storyQuery?.data ?? {};

	const commentSectionData: CommentSectionProps["commentThreads"] =
		React.useMemo(() => {
			return (
				comments?.map((commentThread) => {
					const threadDTO = {
						comment: {
							comment: {
								comment: commentThread.content,
								user: commentThread.author.name,
								avatar: avatarQuery.data?.get(
									commentThread.author.keyPhoto.fileKey,
								)?.downloadUrl,
								datePosted: commentThread.createdAt,
								relationship: commentThread.author.relationToRootMember,
								loading: avatarQuery.isLoading || storyQuery.isLoading,
								numLikes: commentThread.likes,
							},

							replies: commentThread?.replies.map((reply) => {
								const replyDTO: IReply = {
									comment: {
										comment: reply.content,
										user: reply.author.name,
										avatar: avatarQuery.data?.get(reply.author.keyPhoto.fileKey)
											?.downloadUrl,
										datePosted: reply.createdAt,
										relationship: reply.author.relationToRootMember,
										loading: avatarQuery.isLoading || storyQuery.isLoading,
										numLikes: reply.likes,
									},
									replyingTo: commentThread.author.name,
								};
								return replyDTO;
							}),
						},
					};
					return threadDTO;
				}) || []
			);
		}, [avatarQuery.dataUpdatedAt, storyQuery.dataUpdatedAt, isLoading]);

	const typeSafeMedia = React.useMemo(() => {
		return media
			.map((mediaItem) => {
				const src = avatarQuery.data?.get(mediaItem.fileKey)?.downloadUrl;
				const type = mediaItem.type;

				if (src && type) {
					return {
						src,
						type,
					};
				}
			})
			.filter(Boolean) as { src: string; type: "image" | "video" }[];
	}, [avatarQuery.dataUpdatedAt, storyQuery.dataUpdatedAt, isLoading]);

	return (
		<BasePost
			title={title}
			text={content}
			relationship={author.relationToRootMember}
			loading={isLoading}
			user={author.name}
			isLiked={isLiked}
			media={typeSafeMedia}
			setIsLiked={setIsLiked}
			avatar={avatarQuery.data?.get(author.keyPhoto.fileKey)?.downloadUrl}
			storyDate={storyDate}
			commentSectionProps={{
				commentThreads: commentSectionData,
			}}
			numLikes={likes}
		/>
	);
};
