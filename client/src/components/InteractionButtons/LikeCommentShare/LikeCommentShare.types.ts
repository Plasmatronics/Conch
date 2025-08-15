import { FlexProps, IconButtonProps } from "@chakra-ui/react";
import { LikeButtonProps } from "../LikeButton";
import { ShareButtonProps } from "../ShareButton";
import { CommentButtonProps } from "../CommentButton";

export interface LikeCommentShareProps extends FlexProps {
	isLiked: LikeButtonProps["isLiked"];
	setIsLiked: LikeButtonProps["setIsLiked"];
	likeButtonProps?: Omit<LikeButtonProps, "isLiked" | "setIsLiked">;
	shareButtonProps?: ShareButtonProps;
	commentButtonProps?: CommentButtonProps;
	uniformIconButtonProps?: Omit<IconButtonProps, "icon">;
}
