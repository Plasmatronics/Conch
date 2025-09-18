import { Box, Flex } from "@chakra-ui/react";
import { BaseComment } from "../BaseComment";
import { CommentThreadProps } from "./CommentThread.types";
import { useState } from "react";
import { FacePile } from "../../Elements";

const NUM_REPLIES_EXPANDED_ON_CLICK = 5;
const MAX_NUM_AVATARS_IN_FACEPILE = 3;

export const CommentThread = ({
	comment,
	facePileAvatars,
}: CommentThreadProps) => {
	const totalReplies = comment.replies?.length || 0;
	const [repliesShown, setRepliesShown] = useState(0);

	const handleViewRepliesClick = () => {
		if (!totalReplies) return;

		setRepliesShown((prev) => {
			if (prev >= totalReplies) return 0;
			const next = prev + NUM_REPLIES_EXPANDED_ON_CLICK;
			return Math.min(next, totalReplies);
		});
	};

	const numCommentsAdvertised =
		totalReplies <= MAX_NUM_AVATARS_IN_FACEPILE
			? 0
			: totalReplies - MAX_NUM_AVATARS_IN_FACEPILE;

	const repliesRendered = comment.replies?.slice(0, repliesShown) || [];

	return (
		<Flex direction="column" gapY="1rem">
			<BaseComment
				{...comment.comment}
				numRepliesRendered={repliesShown}
				numReplies={totalReplies}
				onViewReplyClick={handleViewRepliesClick}
			/>
			{repliesShown === 0 && facePileAvatars && (
				<Box pl="3.5rem" alignSelf="start">
					<FacePile
						avatars={facePileAvatars}
						size="xs"
						text={
							numCommentsAdvertised > 0
								? `+${numCommentsAdvertised} have commented`
								: "Have Commented"
						}
					/>
				</Box>
			)}
			{repliesRendered.length > 0 && (
				<Flex direction="column" gapY="1rem" pl="3.5rem">
					{repliesRendered.map((reply, idx) => (
						<BaseComment {...reply.comment} key={`reply-${idx}`} />
					))}
				</Flex>
			)}
		</Flex>
	);
};
