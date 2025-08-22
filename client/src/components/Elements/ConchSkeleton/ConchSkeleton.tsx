import { Skeleton } from "@chakra-ui/react";
import { ConchSkeletonProps } from "./ConchSkeleton.types";

export const ConchSkeleton = ({
	children,
	...skeletonProps
}: ConchSkeletonProps) => {
	return (
		<Skeleton width="100%" height="1rem" variant="shine" {...skeletonProps}>
			{children}
		</Skeleton>
	);
};
