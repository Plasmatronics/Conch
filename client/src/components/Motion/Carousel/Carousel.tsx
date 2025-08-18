import React, { useState } from "react";
import { Flex, IconButton } from "@chakra-ui/react";
import { CarouselProps } from "./Carousel.types";
import { motion } from "framer-motion";
import {
	TbChevronDown,
	TbChevronLeft,
	TbChevronRight,
	TbChevronUp,
} from "react-icons/tb";

const MotionFlex = motion(Flex);

export const Carousel = ({
	buttonProps,
	motionFlexProps,
	currentIndex = 0,
	setCurrentIndex = () => {},
	children,
	direction = "horizontal",
	...props
}: CarouselProps) => {
	//0===left, 1=right
	const [motionDirection, setMotionDirection] = useState(0);

	const childArray = React.Children.toArray(children);

	const verticalMotionProps = {
		initial: { opacity: 0, y: motionDirection === 0 ? -100 : 100 },
		animate: { opacity: 1, y: motionDirection === 0 ? 0 : 0 },
		transition: { duration: 0.5 },
	};

	const horizontalMotionProps = {
		initial: { opacity: 0, x: motionDirection === 0 ? -100 : 100 },
		animate: { opacity: 1, x: motionDirection === 0 ? 0 : 0 },
		transition: { duration: 0.5 },
	};

	function handlePrevious() {
		setMotionDirection(0);
		setCurrentIndex((prevIndex) => {
			return prevIndex === 0 ? 0 : prevIndex - 1;
		});
	}

	function handleNext() {
		setMotionDirection(1);
		setCurrentIndex((nextIndex) =>
			nextIndex === childArray.length - 1 ? nextIndex : nextIndex + 1,
		);
	}

	return (
		<Flex
			direction="column"
			justifyContent="center"
			alignItems="center"
			width="25rem"
			height="25rem"
			{...props}
		>
			<Flex
				width="100%"
				height="100%"
				justifyContent="center"
				alignItems="center"
				direction={direction === "horizontal" ? "vertical" : "column"}
			>
				<IconButton
					aria-label="Previous Item"
					borderRadius="full"
					boxShadow="md"
					bgColor="inherit"
					color="black"
					onClick={handlePrevious}
					opacity={currentIndex === 0 ? "0" : "50%"}
					_hover={{ opacity: "100%" }}
					pointerEvents={currentIndex === 0 ? "none" : "auto"}
					{...buttonProps}
				>
					{direction === "horizontal" ? <TbChevronLeft /> : <TbChevronUp />}
				</IconButton>

				<MotionFlex
					key={currentIndex}
					{...(direction === "horizontal"
						? horizontalMotionProps
						: verticalMotionProps)}
					p={4}
					width="80%"
					justifyContent="center"
					alignItems="center"
					{...motionFlexProps}
				>
					{childArray[currentIndex]}
				</MotionFlex>
				<IconButton
					aria-label="Next Item"
					borderRadius="full"
					boxShadow="md"
					bgColor="inherit"
					color="black"
					opacity={currentIndex === childArray.length - 1 ? "0" : "50%"}
					_hover={{ opacity: "100%" }}
					pointerEvents={
						currentIndex === childArray.length - 1 ? "none" : "auto"
					}
					onClick={handleNext}
					{...buttonProps}
				>
					{direction === "horizontal" ? <TbChevronRight /> : <TbChevronDown />}
				</IconButton>
			</Flex>
		</Flex>
	);
};
