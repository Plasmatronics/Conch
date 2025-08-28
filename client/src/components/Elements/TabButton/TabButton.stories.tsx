import type { Meta, StoryFn } from "@storybook/react-vite";

import { TabButton } from "./TabButton";
import { TabButtonProps } from "./TabButton.types";
import { useState } from "react";
import { Flex } from "@chakra-ui/react";

export default {
	title: "Elements/TabButton",
	component: TabButton,
} satisfies Meta<typeof TabButton>;

const Template: StoryFn<TabButtonProps> = (args) => {
	const [isSelected, setIsSelected] = useState(false);

	const handleClick = () => {
		setIsSelected((prev) => !prev);
	};

	return <TabButton {...args} isSelected={isSelected} onClick={handleClick} />;
};

export const Default = Template.bind({});
Default.args = {};

export const OrangeButton = Template.bind({});
OrangeButton.args = {
	unselectedStyles: {
		bg: "orange.300",
		_hover: {
			bg: "orange.400",
		},
	},
	selectedStyles: {
		_hover: {
			bg: "orange.500",
		},
		bg: "orange.600",
	},
};

export const CustomShape = Template.bind({});
CustomShape.args = {
	width: "1rem",
	borderRadius: "xl",
	unselectedStyles: {
		bg: "orange.300",
		_hover: {
			bg: "orange.400",
		},
	},
	selectedStyles: {
		_hover: {
			bg: "orange.500",
		},
		bg: "orange.600",
	},
};

export const ThreeButtons = () => {
	const [curIndex, setCurIndex] = useState(0);

	return (
		<Flex width="100%" height="100%" gap="0.5rem">
			{Array.from({ length: 3 }).map((_, idx) => {
				const isSelected = curIndex === idx;
				const handleClick = () => {
					setCurIndex(idx);
				};

				return (
					<TabButton isSelected={isSelected} onClick={handleClick} key={idx} />
				);
			})}
		</Flex>
	);
};
