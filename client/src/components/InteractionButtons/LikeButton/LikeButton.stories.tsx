import type { Meta, StoryFn } from "@storybook/react-vite";

import { LikeButton } from "./LikeButton";
import { LikeButtonProps } from "./LikeButton.types";
import { useState } from "react";

export default {
	title: "InteractionButtons/LikeButton",
	component: LikeButton,
} satisfies Meta<typeof LikeButton>;

const Template: StoryFn<LikeButtonProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);

	return <LikeButton {...args} isLiked={isLiked} setIsLiked={setIsLiked} />;
};
export const Default = Template.bind({});
Default.args = {};
