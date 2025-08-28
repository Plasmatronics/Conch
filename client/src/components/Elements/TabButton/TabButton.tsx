import { Box } from "@chakra-ui/react";
import { TabButtonProps } from "./TabButton.types";

const unselectedDefaultStyles = {
	bg: "gray.300",
	_hover: {
		bg: "gray.500",
	},
};

const selectedDefaultStyles = {
	bg: "black",
	_hover: { bg: "gray.700" },
};

export const TabButton = ({
	isSelected,
	selectedStyles,
	unselectedStyles,
	...boxProps
}: TabButtonProps) => {
	const curStyles = isSelected
		? selectedStyles || selectedDefaultStyles
		: unselectedStyles || unselectedDefaultStyles;

	return (
		<Box
			width="0.5rem"
			height="0.5rem"
			borderRadius="full"
			bg="transparent"
			{...boxProps}
			{...curStyles}
		/>
	);
};
