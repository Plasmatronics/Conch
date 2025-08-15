import type { Meta, StoryFn } from "@storybook/react-vite";

import { LikeCommentShare } from "./LikeCommentShare";
import { LikeCommentShareProps } from "./LikeCommentShare.types";
import { useState } from "react";
import { Box } from "@chakra-ui/react";

export default {
	title: "InteractionButtons/LikeCommentShare",
	component: LikeCommentShare,
} satisfies Meta<typeof LikeCommentShare>;

const Template: StoryFn<LikeCommentShareProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<Box width="15rem">
			<LikeCommentShare {...args} isLiked={isLiked} setIsLiked={setIsLiked} />
		</Box>
	);
};
export const Default = Template.bind({});
Default.args = {};
