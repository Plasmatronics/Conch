import { Flex } from "@chakra-ui/react";
import { LikeCommentShareProps } from "./LikeCommentShare.types";
import { LikeButton } from "../LikeButton";
import { ShareButton } from "../ShareButton";
import { CommentButton } from "../CommentButton";

export const LikeCommentShare = ({
	isLiked,
	setIsLiked,
	likeButtonProps,
	shareButtonProps,
	commentButtonProps,
	uniformIconButtonProps,
	...flexProps
}: LikeCommentShareProps) => {
	return (
		<Flex width="100%" gap="0.5rem" {...flexProps}>
			<LikeButton
				isLiked={isLiked}
				setIsLiked={setIsLiked}
				{...uniformIconButtonProps}
				{...likeButtonProps}
			/>
			<ShareButton {...uniformIconButtonProps} {...shareButtonProps} />
			<CommentButton {...uniformIconButtonProps} {...commentButtonProps} />
		</Flex>
	);
};
