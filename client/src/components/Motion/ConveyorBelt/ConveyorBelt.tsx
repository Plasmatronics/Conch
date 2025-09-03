import React from "react";
import { ConveyorBeltProps } from "./ConveyorBelt.types";
import { Box, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useConveyorBelt } from "./useConveyorBelt";

const MotionFlex = motion.create(Flex);

export const ConveyorBelt = ({
	children,
	speed = 20,
	...boxProps
}: ConveyorBeltProps) => {
	const { scope } = useConveyorBelt({ speed });

	const childrenArray = React.Children.toArray(children);

	return (
		<Box width="100vw" height="100%" overflow="hidden" {...boxProps}>
			<MotionFlex
				align="center"
				height="100%"
				width="200vw"
				ref={scope}
				justify="space-around"
			>
				{childrenArray.concat(childrenArray).map((child, index) => (
					<Box key={index}>{child}</Box>
				))}
			</MotionFlex>
		</Box>
	);
};
