import type { Meta, StoryFn } from "@storybook/react-vite";

import { TreeCard } from "./TreeCard";
import { TreeCardProps } from "./TreeCard.types";
import { Box } from "@chakra-ui/react";
import { threeCards } from "../sharedTreeProps";

export default {
	title: "Tree/TreeCard",
	component: TreeCard,
} satisfies Meta<typeof TreeCard>;

const Template: StoryFn<TreeCardProps> = (args) => {
	return (
		<Box width="100vw" height="100vh" bg="gray.200" pt="5rem">
			<TreeCard mx="auto" my="auto" {...args} />
		</Box>
	);
};

export const SingleCard = Template.bind({});
SingleCard.args = {
	memberData: threeCards[0],
};

export const TwoTabCard = Template.bind({});
TwoTabCard.args = {
	memberData: threeCards.slice(0, 2),
};

export const ThreeTabCard = Template.bind({});
ThreeTabCard.args = {
	memberData: threeCards,
};
