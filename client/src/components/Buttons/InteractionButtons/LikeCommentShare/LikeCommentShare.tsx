import { Flex, Separator } from "@chakra-ui/react";
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
	noBottomSeparator,
	uniformIconButtonProps,
	...flexProps
}: LikeCommentShareProps) => {
	return (
		<Flex width="100%" direction="column" gap="0.5rem" {...flexProps}>
			<Separator />
			<Flex width="100%" gap="0.5rem">
				<LikeButton
					flex="1"
					isLiked={isLiked}
					setIsLiked={setIsLiked}
					{...uniformIconButtonProps}
					{...likeButtonProps}
				/>
				<CommentButton
					flex="1"
					{...uniformIconButtonProps}
					{...commentButtonProps}
				/>
				<ShareButton
					flex="1"
					{...uniformIconButtonProps}
					{...shareButtonProps}
				/>
			</Flex>
			{!noBottomSeparator && <Separator />}
		</Flex>
	);
};
