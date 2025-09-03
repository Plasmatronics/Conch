import React from "react";
import { ConveyorBeltProps } from "./ConveyorBelt.types";
import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useConveyorBelt } from "./useConveyorBelt";

const MotionFlex = motion.create(Flex);

export const ConveyorBelt = ({
	children,
	speed = 20,
	gap = "5rem",
	onItemHover,
	direction = "right",
	onItemLeave,
	...boxProps
}: ConveyorBeltProps) => {
	const childrenArray = React.Children.toArray(children);
	const { scope, runBelt, pauseBelt } = useConveyorBelt({
		speed,
		direction,
		gap,
	});

	const handleItemHover = () => {
		pauseBelt();
		onItemHover?.();
	};
	const handleItemLeave = () => {
		runBelt();
		onItemLeave?.();
	};

	return (
		<Box bg="red.100" py="0.5rem" {...boxProps} width="100vw" overflow="hidden">
			<MotionFlex
				align="center"
				height="100%"
				width={`calc(200vw + ${gap})`}
				ref={scope}
				willChange="transform"
			>
				{Array.from({ length: 2 }).map((_, index) => (
					<Flex
						gap={gap}
						width={`calc(100vw + ${gap})`}
						height="100%"
						mx={`calc(${gap}/2)`}
						key={`children-flex-${index}`}
					>
						{childrenArray.map((child, childIndex) => (
							<Box
								onMouseEnter={handleItemHover}
								onMouseLeave={handleItemLeave}
								height="100%"
								key={`children-flex-${index}, child-index-${childIndex}`}
							>
								{child}
							</Box>
						))}
					</Flex>
				))}
			</MotionFlex>
		</Box>
	);
};
