import { BoxProps } from "@chakra-ui/react";

export interface TabButtonProps extends BoxProps {
	isSelected: boolean;
	selectedStyles?: BoxProps;
	unselectedStyles?: BoxProps;
}
