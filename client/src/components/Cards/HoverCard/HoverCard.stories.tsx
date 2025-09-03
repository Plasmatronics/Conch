import type { Meta, StoryFn } from "@storybook/react-vite";

import { HoverCard } from "./HoverCard";
import { HoverCardProps } from "./HoverCard.types";
import { Avatar as ChakraAvatar } from "@chakra-ui/react";
import { threeCards, TreeCard as ConchTreeCard } from "../../Tree";

export default {
	title: "Cards/HoverCard",
	component: HoverCard,
} satisfies Meta<typeof HoverCard>;

const Template: StoryFn<HoverCardProps> = (args) => {
	return <HoverCard {...args} />;
};

export const Avatar = Template.bind({});
Avatar.args = {
	avatar:
		"https://hips.hearstapps.com/hmg-prod/images/jack-the-ripper-9351486-1-402.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*",
	user: "Jack the Ripper",
	relationship: "Killer",
	overview: "One of the most ruthless killers in history",
	numMemories: 21,
	trigger: (
		<ChakraAvatar.Root size="xl">
			<ChakraAvatar.Image
				src="https://hips.hearstapps.com/hmg-prod/images/jack-the-ripper-9351486-1-402.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*"
				alt="Jack the Ripper"
			/>
			<ChakraAvatar.Fallback name="Jack the Ripper" />
		</ChakraAvatar.Root>
	),
};

export const TreeCard = Template.bind({});
TreeCard.args = {
	avatar:
		"https://hips.hearstapps.com/hmg-prod/images/jack-the-ripper-9351486-1-402.jpg?crop=1.00xw:1.00xh;0,0&resize=1200:*",
	user: "Jack the Ripper",
	relationship: "Killer",
	overview: "One of the most ruthless killers in history",
	numMemories: 21,
	trigger: (
		<ConchTreeCard memberData={threeCards[0]} width="10rem" height="15rem" />
	),
};
