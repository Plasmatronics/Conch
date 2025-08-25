import { Flex } from "@chakra-ui/react";
import { CommentSectionProps } from "./CommentSection.types";
import { CommentThread } from "../CommentThread";

export const CommentSection = ({ commentThreads }: CommentSectionProps) => {
	return (
		<Flex width="100%" height="100%" direction="column" gapY="2rem">
			{commentThreads.map((thread, idx) => (
				<CommentThread {...thread} key={`thread-${idx}`} />
			))}
		</Flex>
	);
};
