import { SkeletonCircle, FlexProps, Flex } from "@chakra-ui/react";
import { ConchSkeleton } from "../../Elements";

export const BaseCommentSkeleton = ({ ...flexProps }: FlexProps) => {
	return (
		<Flex
			height="100%"
			width="100%"
			alignItems="center"
			justifyContent="center"
			gap="1rem"
			{...flexProps}
		>
			<SkeletonCircle variant="shine" size="12" />
			<Flex flex="1" direction="column" gap="0.25rem" justifyContent="center">
				<ConchSkeleton />
				<ConchSkeleton width="80%" />
			</Flex>
		</Flex>
	);
};
