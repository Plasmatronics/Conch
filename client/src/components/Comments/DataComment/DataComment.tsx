import { useState } from "react";
import { BaseComment } from "../BaseComment";
import { HydratedCommentDTO } from "@conch/shared";
import { useDataComment } from "./useDataComment";

export interface DataCommentProps {
	commentId: HydratedCommentDTO["id"];
}

// comment: string;
// user: string;
// avatar: AvatarImageProps["src"];
// datePosted: Date;
// relationship: string;
// numRepliesRendered?: number;
// numReplies?: number;
// loading?: boolean;
// isLiked: LikeCommentShareProps["isLiked"];
// setIsLiked: LikeCommentShareProps["setIsLiked"];
// onReplyClick?: () => void;
// onViewReplyClick?: () => void;

export const DataComment = ({ commentId }: DataCommentProps) => {
	const [isLiked, setIsLiked] = useState(false);

	const { commentQuery, authorQuery } = useDataComment({ commentId });
	const isDataLoading =
		commentQuery.isLoading ||
		authorQuery.keyPhotoQuery.isLoading ||
		authorQuery.memberQuery.isLoading;

	const avatarImage = authorQuery.keyPhotoQuery.data?.at(0)?.downloadUrl;
	const {
		content = "",
		createdAt = new Date(),
		replies = [],
	} = commentQuery.data || {};
	const { relationToRootMember = "", name = "" } =
		authorQuery.memberQuery.data || {};
	console.log(commentQuery.data?.replies);

	return (
		<BaseComment
			loading={isDataLoading}
			comment={content}
			user={name}
			numReplies={replies.length}
			datePosted={createdAt}
			avatar={avatarImage}
			relationship={relationToRootMember}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
		/>
	);
};
