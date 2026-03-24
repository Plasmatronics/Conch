import { BasePost } from "../BasePost";
import React from "react";
import {
	HydratedStoryDTO,
	HydratedUserDTO,
	HydratedCommentDTO,
	MAX_CHARS_IN_COMMENT,
	UserDTOMemberPopulated,
	PopulatedStoryDTO,
} from "@conch/shared";
import { CommentSectionProps, IReply } from "../../Comments";
import { useForm } from "react-hook-form";
import { useFetchUserData } from "../../../api";
import { useDataPostComment, useDataPost, useLike } from "./hooks";
import { CardRootProps } from "@chakra-ui/react";

interface ControlledProps {
	story: PopulatedStoryDTO;
	user: UserDTOMemberPopulated;
	avatarAndMediaMap: Map<
		string,
		{
			downloadUrl: string;
			type: string;
		}
	>;
	commentAuthorMap: Map<
		string,
		{
			authorId: HydratedUserDTO["id"];
			name: HydratedUserDTO["name"];
		}
	>;
	loading: boolean;
}

export interface DataPostProps
	extends Omit<CardRootProps, "content" | "title"> {
	storyId: HydratedStoryDTO["id"];
	userId: HydratedUserDTO["id"];
	controlledProps?: ControlledProps;
}

export type DataPostCommentInputs = {
	comment: string;
	replyingToName: HydratedUserDTO["name"];
	replyingToId: HydratedUserDTO["id"];
};

export const DataPost = ({
	userId,
	storyId,
	controlledProps,
	...cardRootProps
}: DataPostProps) => {
	const { storyQuery, avatarQuery, commentAuthorMap } = useDataPost({
		storyId,
		enabled: !controlledProps?.story,
	});

	const { userQuery, avatarQuery: userAvatarQuery } = useFetchUserData({
		userId,
		includeParamsValues: ["member"],
		enabled: !controlledProps?.user,
	});

	const uncontrolledLoadingState =
		storyQuery.isLoading ||
		avatarQuery.isLoading ||
		userQuery.isLoading ||
		userAvatarQuery.isLoading;

	const isLoading = controlledProps
		? controlledProps.loading
		: uncontrolledLoadingState;

	const uncontrolledMediaMap = new Map([
		...(userAvatarQuery.data || []),
		...(avatarQuery.data || []),
	]);

	const mediaMap = controlledProps
		? controlledProps.avatarAndMediaMap
		: uncontrolledMediaMap;

	const userAvatar = mediaMap.get(
		controlledProps
			? controlledProps.user.familyTreeMember?.keyPhoto.fileKey || ""
			: userQuery.data?.familyTreeMember?.keyPhoto.fileKey || "",
	)?.downloadUrl;

	const userFullName = controlledProps
		? controlledProps.user.name
		: userQuery.data?.name;

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
		userId: controlledProps ? controlledProps.user.id : userId,
		storyId: controlledProps ? controlledProps.story.id : storyId,
		onSuccess: () => reset(),
	});

	const { mutate: mutateLike } = useLike({
		userId: controlledProps ? controlledProps.user.id : userId,
		storyId: controlledProps ? controlledProps.story.id : storyId,
	});

	const handleReplyClick = (targetCommentId: HydratedCommentDTO["id"]) => {
		const targetUser = controlledProps
			? controlledProps.commentAuthorMap.get(targetCommentId)
			: commentAuthorMap.get(targetCommentId);
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
			relationToMember: controlledProps
				? controlledProps.user.familyTreeMember.relationToMember
				: userQuery.data?.familyTreeMember.relationToMember || "friend",
		});
	});

	const clearReplyTarget = () => {
		setValue("replyingToId", "");
		setValue("replyingToName", "");
	};

	const {
		author = {
			familyTreeMember: {
				name: "",
				relationToMember: "",
				keyPhoto: {
					fileKey: "",
					type: "image",
				},
			},
		},
		title = "",
		isLikedByUser,
		storyDate = new Date(),
		content = "",
		media = [],
		likes = 0,
		comments,
	} = controlledProps ? controlledProps.story : storyQuery?.data || {};

	const commentSectionData: CommentSectionProps["commentThreads"] =
		React.useMemo(() => {
			return (
				comments?.map((commentThread) => {
					const threadDTO = {
						comment: {
							comment: {
								isLiked: commentThread.isLikedByUser || false,
								comment: commentThread.content,
								user: commentThread.author.familyTreeMember.name,
								avatar: mediaMap.get(
									commentThread.author.familyTreeMember.keyPhoto.fileKey,
								)?.downloadUrl,
								onReplyClick: () => {
									handleReplyClick(commentThread.id);
								},
								onToggleLike: () => {
									mutateLike({ commentId: commentThread.id, type: "Comment" });
								},
								datePosted: commentThread.createdAt,
								relationship:
									commentThread.author.familyTreeMember.relationToMember,
								loading: avatarQuery.isLoading || storyQuery.isLoading,
								numLikes: commentThread.likes,
							},

							replies: commentThread?.replies?.map((reply) => {
								const replyDTO: IReply = {
									comment: {
										isLiked: reply.isLikedByUser || false,
										comment: reply.content,
										user: reply.author.familyTreeMember.name,
										avatar: mediaMap.get(
											reply.author.familyTreeMember.keyPhoto.fileKey,
										)?.downloadUrl,
										datePosted: reply.createdAt,
										replyToName: reply?.replyingTo?.name,
										relationship:
											reply.author.familyTreeMember.relationToMember,
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
				const src = mediaMap.get(mediaItem.fileKey)?.downloadUrl;
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
			relationship={author.familyTreeMember.relationToMember}
			loading={isLoading}
			user={author.familyTreeMember.name}
			isLiked={isLikedByUser || false}
			media={typeSafeMedia}
			setIsLiked={() => {
				mutateLike({ type: "Story" });
			}}
			avatar={
				mediaMap.get(author?.familyTreeMember.keyPhoto.fileKey)?.downloadUrl
			}
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
				placeholder: `Comment as ${controlledProps?.user.name || userQuery.data?.name}...`,
				user: userFullName || "",
				avatar: userAvatar,
				posting: isPending || isSubmitting,
				onHandleBackspace: handleBackspace,
			}}
			numLikes={likes}
			{...cardRootProps}
		/>
	);
};
