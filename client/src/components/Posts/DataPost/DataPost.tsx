import { BasePost } from "../BasePost";
import React from "react";
import {
	HydratedStoryDTO,
	HydratedUserDTO,
	HydratedCommentDTO,
	MAX_CHARS_IN_COMMENT,
} from "@conch/shared";
import { CommentSectionProps, IReply } from "../../Comments";
import { useForm } from "react-hook-form";
import { useFetchUserData } from "../../../api";
import { useDataPostComment, useDataPost, useLike } from "./hooks";

export interface DataPostProps {
	storyId: HydratedStoryDTO["id"];
	userId: HydratedUserDTO["id"];
}

export type DataPostCommentInputs = {
	comment: string;
	replyingToName: HydratedUserDTO["name"];
	replyingToId: HydratedUserDTO["id"];
};

export const DataPost = ({ userId, storyId }: DataPostProps) => {
	const { storyQuery, avatarQuery, commentAuthorMap } = useDataPost(storyId);
	const isLoading = storyQuery.isLoading || avatarQuery.isLoading;

	const { userQuery, avatarQuery: userAvatarQuery } = useFetchUserData({
		userId,
		includeParamsValues: ["member"],
	});

	const userAvatar =
		userQuery.data?.familyTreeMember.keyPhoto &&
		userAvatarQuery.data?.get(userQuery.data?.familyTreeMember.keyPhoto.fileKey)
			?.downloadUrl;

	const userFullName = userQuery.data?.name;

	const {
		handleSubmit,
		reset,
		setValue,
		getValues,
		register,
		formState: { isSubmitting },
	} = useForm<DataPostCommentInputs>({
		defaultValues: { comment: "", replyingToName: "", replyingToId: "" },
		mode: "onSubmit",
	});

	const { mutate, isPending } = useDataPostComment({
		userId,
		storyId,
		onSuccess: () => reset(),
	});

	const { mutate: mutateLike } = useLike({
		userId,
		storyId,
	});

	const handleReplyClick = (targetCommentId: HydratedCommentDTO["id"]) => {
		const targetUser = commentAuthorMap.get(targetCommentId);
		if (!targetCommentId || !targetUser) return;

		if (!getValues("comment").startsWith(`@${targetUser.name}`))
			setValue("comment", `@${targetUser.name} `);

		setValue("replyingToId", targetUser.authorId);
		setValue("replyingToName", targetUser.name);
	};

	const handleBackspace = () => {
		if (getValues("comment") === `@${getValues("replyingToName")}`) {
			clearReplyTarget();
			setValue("comment", "");
		}
	};

	const handleCommentSubmit = handleSubmit((data) => {
		let commentWithoutMention = data.comment;
		if (getValues("replyingToName")) {
			commentWithoutMention = commentWithoutMention.replace(
				`@${getValues("replyingToName")}`,
				"",
			);
		}
		const trimmedComment = commentWithoutMention.trim();

		if (!trimmedComment) return;

		return mutate({
			comment: trimmedComment,
			replyingTo: data.replyingToId,
			userAvatar: userAvatar || "",
			author: userFullName || "",
			relationToRootMember:
				userQuery.data?.familyTreeMember.relationToRootMember || "",
		});
	});

	const clearReplyTarget = () => {
		setValue("replyingToId", "");
		setValue("replyingToName", "");
	};

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
		isLikedByUser,
		storyDate = new Date(),
		content = "",
		media = [],
		likes = 0,
		comments,
	} = storyQuery?.data || {};

	const commentSectionData: CommentSectionProps["commentThreads"] =
		React.useMemo(() => {
			return (
				comments?.map((commentThread) => {
					const threadDTO = {
						comment: {
							comment: {
								isLiked: commentThread.isLikedByUser || false,
								comment: commentThread.content,
								user: commentThread.author.name,
								avatar: avatarQuery.data?.get(
									commentThread.author.keyPhoto.fileKey,
								)?.downloadUrl,
								onReplyClick: () => {
									handleReplyClick(commentThread.id);
								},
								onToggleLike: () => {
									mutateLike({ commentId: commentThread.id, type: "Comment" });
								},
								datePosted: commentThread.createdAt,
								relationship: commentThread.author.relationToRootMember,
								loading: avatarQuery.isLoading || storyQuery.isLoading,
								numLikes: commentThread.likes,
							},

							replies: commentThread?.replies?.map((reply) => {
								const replyDTO: IReply = {
									comment: {
										isLiked: reply.isLikedByUser || false,
										comment: reply.content,
										user: reply.author.name,
										avatar: avatarQuery.data?.get(reply.author.keyPhoto.fileKey)
											?.downloadUrl,
										datePosted: reply.createdAt,
										replyToName: reply?.replyingTo?.name,
										relationship: reply.author.relationToRootMember,
										loading: avatarQuery.isLoading || storyQuery.isLoading,
										numLikes: reply.likes,
										onReplyClick: () => {
											handleReplyClick(reply.id);
										},
										onToggleLike: () => {
											mutateLike({
												commentId: reply.id,
												type: "Comment",
											});
										},
									},
									replyingTo: commentThread.replyingTo?.name || "",
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
			isLiked={isLikedByUser || false}
			media={typeSafeMedia}
			setIsLiked={() => {
				mutateLike({ type: "Story" });
			}}
			avatar={avatarQuery.data?.get(author.keyPhoto.fileKey)?.downloadUrl}
			storyDate={storyDate}
			commentSectionProps={{
				commentThreads: commentSectionData,
			}}
			postCommentProps={{
				registerField: register("comment", {
					maxLength: {
						value: MAX_CHARS_IN_COMMENT,
						message: `Comment must be ${MAX_CHARS_IN_COMMENT} characters or less.`,
					},
				}),
				onSubmit: handleCommentSubmit,
				placeholder: `Comment as ${userQuery.data?.name}...`,
				user: userFullName || "",
				avatar: userAvatar,
				posting: isPending || isSubmitting,
				onHandleBackspace: handleBackspace,
			}}
			numLikes={likes}
		/>
	);
};
