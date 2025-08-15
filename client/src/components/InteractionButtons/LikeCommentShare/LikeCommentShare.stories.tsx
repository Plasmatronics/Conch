import type { Meta, StoryFn } from "@storybook/react-vite";

import { LikeCommentShare } from "./LikeCommentShare";
import { LikeCommentShareProps } from "./LikeCommentShare.types";
import { useState } from "react";

export default {
	title: "InteractionButtons/LikeCommentShare",
	component: LikeCommentShare,
} satisfies Meta<typeof LikeCommentShare>;

const Template: StoryFn<LikeCommentShareProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<LikeCommentShare {...args} isLiked={isLiked} setIsLiked={setIsLiked} />
	);
};
export const Default = Template.bind({});
Default.args = {};
