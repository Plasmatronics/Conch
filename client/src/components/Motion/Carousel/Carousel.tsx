import React, { useEffect, useState } from "react";
import { Flex, IconButton } from "@chakra-ui/react";
import { CarouselProps } from "./Carousel.types";
import { motion } from "framer-motion";
import {
	TbChevronDown,
	TbChevronLeft,
	TbChevronRight,
	TbChevronUp,
} from "react-icons/tb";

const MotionFlex = motion.create(Flex);

export const Carousel = ({
	buttonProps,
	motionFlexProps,
	currentIndex = 0,
	setCurrentIndex = () => {},
	children,
	direction = "horizontal",
	loop = true,
	...props
}: CarouselProps) => {
	//0===left, 1=right
	const [motionDirection, setMotionDirection] = useState(0);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const childArray = React.Children.toArray(children);

	const verticalMotionProps = {
		initial: hasMounted
			? { opacity: 0, y: motionDirection === 0 ? -100 : 100 }
			: { opacity: 1, y: 0 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5 },
	};

	const horizontalMotionProps = {
		initial: hasMounted
			? { opacity: 0, x: motionDirection === 0 ? -100 : 100 }
			: { opacity: 1, x: 0 },
		animate: { opacity: 1, x: 0 },
		transition: { duration: 0.5 },
	};

	function handlePrevious() {
		setMotionDirection(0);
		setCurrentIndex((prev) => {
			if (prev === 0) {
				return loop ? childArray.length - 1 : 0;
			} else {
				return prev - 1;
			}
		});
	}

	function handleNext() {
		setMotionDirection(1);
		setCurrentIndex((prev) => {
			if (prev === childArray.length - 1) {
				return loop ? 0 : prev;
			} else {
				return prev + 1;
			}
		});
	}

	const shouldShowButton = () => {
		return childArray.length !== 1 && loop;
	};

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
					bgColor="white"
					color="black"
					onClick={handlePrevious}
					opacity={!shouldShowButton() && currentIndex === 0 ? "0" : "75%"}
					_hover={{ opacity: "100%" }}
					pointerEvents={
						!shouldShowButton() && currentIndex === 0 ? "none" : "auto"
					}
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
					bgColor="white"
					color="black"
					opacity={
						!shouldShowButton() && currentIndex === childArray.length - 1
							? "0"
							: "75%"
					}
					_hover={{ opacity: "100%" }}
					pointerEvents={
						!shouldShowButton() && currentIndex === childArray.length - 1
							? "none"
							: "auto"
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
