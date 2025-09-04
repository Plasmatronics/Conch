import { IconProps } from "@chakra-ui/react";
import { AnimatePresenceProps, SVGMotionProps } from "framer-motion";
import { IconType } from "react-icons/lib";

type MotionIconProps = IconProps & SVGMotionProps<SVGSVGElement>;

interface ITransitionIcons {
	icon: IconType;
	styles?: MotionIconProps;
}

export interface TransitionIconProps extends AnimatePresenceProps {
	icons: ITransitionIcons[];
	activeIconIndex: number;
	uniformIconStyles?: MotionIconProps;
}
