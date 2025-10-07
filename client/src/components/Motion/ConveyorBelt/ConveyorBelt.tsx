import React from "react";
import { ConveyorBeltProps } from "./ConveyorBelt.types";
import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useConveyorBelt } from "./useConveyorBelt";

const MotionFlex = motion.create(Flex);

export const ConveyorBelt = ({
	children,
	speed = 20,
	onItemHover,
	direction = "right",
	onItemLeave,
	...boxProps
}: ConveyorBeltProps) => {
	const childrenArray = React.Children.toArray(children);
	const { scope, runBelt, pauseBelt } = useConveyorBelt({
		speed,
		direction,
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
		<Box
			py="0.5rem"
			minH="1rem"
			{...boxProps}
			width="100%"
			overflow="hidden"
			bg="white"
			borderTop="1px solid black"
			borderBottom="1px solid black"
		>
			<MotionFlex
				align="center"
				height="100%"
				width="200%"
				ref={scope}
				willChange="transform"
				justify="space-around"
			>
				{Array.from({ length: 2 }).map((_, index) => (
					<Flex
						width="50%"
						height="100%"
						justify="space-around"
						flexShrink="0"
						align="center"
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
