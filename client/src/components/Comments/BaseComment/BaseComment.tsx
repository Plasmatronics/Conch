import { Avatar, Flex, Text } from "@chakra-ui/react";
import { BaseCommentProps } from "./BaseComment.types";
import { LikeButton } from "../../Buttons";
import { getPrettyDate } from "../../../utils";
import React from "react";
import { ExpandableText } from "../../Typography";
import { BaseCommentSkeleton } from "./BaseCommentSkeleton";

const MAX_CHARS_BEFORE_TRUNCATION = 500;

export const BaseComment = ({
	comment,
	user,
	avatar,
	datePosted,
	relationship,
	numLikes,
	onReplyClick,
	loading,
	onViewReplyClick,
	numReplies = 0,
	numRepliesRendered = 0,
}: BaseCommentProps) => {
	const [isLiked, setIsLiked] = React.useState(false);
	const ageMs = React.useMemo(() => {
		const time = new Date(datePosted).getTime();
		return Math.max(0, Date.now() - time);
	}, [datePosted]);

	const remaining = Math.max(0, numReplies - numRepliesRendered);
	const isThreadFullyExpanded = numReplies > 0 && remaining === 0;

	const handleReplyClick = () => {
		onReplyClick?.();
	};

	const handleViewRepliesClick = () => {
		onViewReplyClick?.();
	};

	const handleLike = () => {
		setIsLiked((prev) => !prev);
	};

	const handleDoubleClick = () => {
		if (!isLiked) {
			setIsLiked(true);
		}
	};

	return (
		<Flex width="100%" gapX="1rem">
			{loading ? (
				<BaseCommentSkeleton />
			) : (
				<>
					<Avatar.Root size="md">
						<Avatar.Fallback name={user} />
						<Avatar.Image src={avatar} alt={user} />
					</Avatar.Root>

					<Flex width="100%" direction="column">
						<Text fontWeight="medium">{`${user} `}</Text>
						<ExpandableText
							onDoubleClick={handleDoubleClick}
							containerProps={{ mb: "0.5rem" }}
							text={comment}
							maxCharCount={MAX_CHARS_BEFORE_TRUNCATION}
						/>
						<Flex width="100%" gap="1rem">
							<Text>{getPrettyDate(ageMs)}</Text>
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

					<Flex align="center" gap="0.5rem" direction="column">
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
						{numLikes > 0 && (
							<Text fontSize="sm" color="gray.500">
								{numLikes}
							</Text>
						)}
					</Flex>
				</>
			)}
		</Flex>
	);
};
