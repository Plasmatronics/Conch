import {
	Box,
	BoxProps,
	Flex,
	SkeletonCircle,
	SkeletonProps,
} from "@chakra-ui/react";
import { ConchSkeleton } from "../../Elements";
import { ReactNode } from "react";

interface BasePostSkeletonProps extends BoxProps {
	children?: ReactNode;
	loading: SkeletonProps["loading"];
}

export const BasePostSkeleton = ({
	children,
	loading,
	...BoxProps
}: BasePostSkeletonProps) => {
	return (
		<Box width="100%" {...BoxProps}>
			{loading && (
				<Flex p="1.5rem" height="100%" width="100%" gap="1.25rem">
					<Flex
						height="100%"
						width="100%"
						alignItems="center"
						justifyContent="center"
						gap="1rem"
					>
						<SkeletonCircle variant="shine" size="12" />
						<Flex
							flex="1"
							direction="column"
							gap="0.25rem"
							justifyContent="center"
						>
							<ConchSkeleton />
							<ConchSkeleton width="80%" />
						</Flex>
					</Flex>
					<Flex direction="column" gap="0.5rem" justifyContent="center">
						{Array.from({ length: 4 }).map((_, index) => (
							<ConchSkeleton key={index} width={index === 3 ? "80%" : "100%"} />
						))}
					</Flex>
				</Flex>
			)}
			{children}
			{loading && (
				<Flex
					p="1.5rem"
					pt="0rem"
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="space-around"
				>
					{Array.from({ length: 3 }).map((_, index) => (
						<ConchSkeleton key={index} width="5rem" />
					))}
				</Flex>
			)}
		</Box>
	);
};
