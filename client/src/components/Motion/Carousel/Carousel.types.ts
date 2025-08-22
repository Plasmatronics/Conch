import type { FlexProps, IconButtonProps } from "@chakra-ui/react";
import { MotionProps } from "framer-motion";

export interface CarouselProps extends FlexProps {
	children?: React.ReactNode;
	buttonProps?: IconButtonProps;
	motionFlexProps?: FlexProps & MotionProps;
	currentIndex?: number;
	setCurrentIndex?: React.Dispatch<React.SetStateAction<number>>;
	loop?: boolean;

	direction?: "vertical" | "horizontal";
}
