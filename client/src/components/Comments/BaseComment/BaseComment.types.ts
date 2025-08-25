import { AvatarImageProps } from "@chakra-ui/react";

export interface BaseCommentProps {
	comment: string;
	user: string;
	avatar: AvatarImageProps["src"];
	datePosted: Date;
	relationship: string;
	numRepliesRendered?: number;
	numReplies?: number;
	onReplyClick?: () => void;
	onViewReplyClick?: () => void;
}
