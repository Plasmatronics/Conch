import type { Meta, StoryFn } from "@storybook/react-vite";

import { TreeCard } from "./TreeCard";
import { TreeCardProps } from "./TreeCard.types";
import { Box } from "@chakra-ui/react";

export default {
	title: "Tree/TreeCard",
	component: TreeCard,
} satisfies Meta<typeof TreeCard>;

const threeCards: TreeCardProps["memberData"] = [
	{
		name: "Nicholas Hussen",
		numMemories: 12,
		birthYear: 2001,
		image:
			"https://www.format.com/wp-content/uploads/portrait_of_black_man-731x1024.jpg",
	},
	{
		name: "Dean Bruno",
		numMemories: 122,
		birthYear: 1974,
		deathYear: 2023,
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPOnqP46nO1bLgIknVoJCgF-Ti_2Qck6Ne9w&s",
	},
	{
		name: "Barry Wood",
		numMemories: 101,
		birthYear: 1932,
		deathYear: 2003,
		image:
			"https://pbs.twimg.com/profile_images/1681270373684244485/9SxqeNHa_400x400.jpg",
	},
];

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
