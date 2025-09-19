import { Flex } from "@chakra-ui/react";
import { CommentSectionProps } from "./CommentSection.types";
import { CommentThread } from "../CommentThread";

export const CommentSection = ({
	commentThreads,
	...flexProps
}: CommentSectionProps) => {
	return (
		<Flex
			width="100%"
			height="100%"
			px="1rem"
			{...flexProps}
			direction="column"
			gapY="1.5rem"
		>
			{commentThreads.map((thread, idx) => (
				<CommentThread {...thread} key={`thread-${idx}`} />
			))}
		</Flex>
	);
};
