import { AvatarImageProps } from "@chakra-ui/react";
import { LikeCommentShareProps } from "components/Buttons";

export interface BaseCommentProps {
	comment: string;
	user: string;
	avatar: AvatarImageProps["src"];
	datePosted: Date;
	relationship: string;
	numRepliesRendered?: number;
	numReplies?: number;
	loading?: boolean;
	isLiked: LikeCommentShareProps["isLiked"];
	setIsLiked: LikeCommentShareProps["setIsLiked"];
	onReplyClick?: () => void;
	onViewReplyClick?: () => void;
}
