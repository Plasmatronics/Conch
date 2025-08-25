import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { BaseCommentProps } from "./BaseComment.types";
import { LikeButton } from "../../Buttons";
import { getPrettyDate } from "../../../utils";
import React from "react";

const MAX_CHARS_BEFORE_TRUNCATION = 500;

export const BaseComment = ({
	comment,
	user,
	avatar,
	datePosted,
	relationship,
	onReplyClick,
	onViewReplyClick,
	numReplies = 0,
	numRepliesRendered = 0,
}: BaseCommentProps) => {
	const [isLiked, setIsLiked] = React.useState(false);
	const [isExpanded, setIsExpanded] = React.useState(false);

	const remaining = Math.max(0, numReplies - numRepliesRendered);
	const isThreadFullyExpanded = numReplies > 0 && remaining === 0;

	const truncatedString = comment.slice(0, MAX_CHARS_BEFORE_TRUNCATION);
	const isTruncated = truncatedString.length < comment.length;

	const handlePostExpansion = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsExpanded(true);
	};

	const handleReplyClick = () => {
		onReplyClick?.();
	};

	const handleViewRepliesClick = () => {
		onViewReplyClick?.();
	};

	const handleLike = () => {
		return setIsLiked((prev) => !prev);
	};

	const handleDoubleClick = () => {
		if (!isLiked) {
			setIsLiked(true);
		}
	};

	return (
		<Flex width="100%" gapX="1rem">
			<Avatar.Root size="md">
				<Avatar.Fallback name={user} />
				<Avatar.Image src={avatar} alt={user} />
			</Avatar.Root>

			<Flex width="100%" direction="column">
				<Text onDoubleClick={handleDoubleClick}>
					<Box as="span" fontWeight="medium">
						{`${user} `}
					</Box>
					<Box as="span">
						{!isExpanded && isTruncated ? `${truncatedString}... ` : comment}
						{!isExpanded && isTruncated && (
							<Box
								as="span"
								fontWeight="semibold"
								onClick={handlePostExpansion}
								_hover={{ textDecoration: "underline" }}
							>
								See More
							</Box>
						)}
					</Box>
				</Text>
				<Flex width="100%" gap="1rem">
					<Text>{getPrettyDate(Date.now() - datePosted.getTime())}</Text>
					<Text>{relationship}</Text>
					<Text
						onClick={handleReplyClick}
						_hover={{ color: "gray.400", cursor: "pointer" }}
						as="button"
						role="button"
					>
						Reply
					</Text>
					{numReplies > 0 && (
						<Text
							_hover={{ color: "gray.400", cursor: "pointer" }}
							onClick={handleViewRepliesClick}
							as="button"
							role="button"
						>
							{isThreadFullyExpanded
								? "Hide Replies"
								: `View Replies (${remaining})`}
						</Text>
					)}
				</Flex>
			</Flex>

			<LikeButton
				pt="2rem"
				bg="transparent"
				_hover={{
					bg: "transparent",
					color: isLiked ? "red.400" : "gray.400",
				}}
				isLiked={isLiked}
				setIsLiked={handleLike}
			/>
		</Flex>
	);
};
