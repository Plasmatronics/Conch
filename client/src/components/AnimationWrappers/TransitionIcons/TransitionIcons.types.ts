import { IconProps } from "@chakra-ui/react";
import { AnimatePresenceProps, MotionProps } from "framer-motion";
import { IconType } from "react-icons/lib";

export type MotionIconProps = MotionProps & IconProps;

interface ITransitionIcons {
	icon: IconType;
	styles?: MotionIconProps;
}

export interface TransitionIconProps extends AnimatePresenceProps {
	icons: ITransitionIcons[];
	activeIconIndex: number;
	unanimated?: boolean;
	uniformIconStyles?: MotionIconProps;
}
