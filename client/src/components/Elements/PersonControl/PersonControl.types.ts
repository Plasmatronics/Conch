import {
	SegmentGroupIndicatorProps,
	SegmentGroupRootProps,
} from "@chakra-ui/react";
import { MotionIconProps } from "../../AnimationWrappers";

export interface PersonControlProps extends SegmentGroupRootProps {
	uniformIconProps?: MotionIconProps;
	indicatorProps?: SegmentGroupIndicatorProps;
	inactiveStyles?: MotionIconProps;
	activeStyles?: MotionIconProps;

	mediaIconProps?: MotionIconProps;
	aboutIconProps?: MotionIconProps;
	mapIconProps?: MotionIconProps;
}
