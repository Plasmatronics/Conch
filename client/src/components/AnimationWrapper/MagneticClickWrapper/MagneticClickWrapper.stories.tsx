import type { Meta, StoryFn } from "@storybook/react-vite";

import { MagneticClickWrapper } from "./MagneticClickWrapper";
import { MagneticClickWrapperProps } from "./MagneticClickWrapper.types";
import { FaComment, FaHeart } from "react-icons/fa";
import { IconButton } from "@chakra-ui/react";

export default {
	title: "InteractionButtons/MagneticClickWrapper",
	component: MagneticClickWrapper,
} satisfies Meta<typeof MagneticClickWrapper>;

const Template: StoryFn<MagneticClickWrapperProps> = (args) => {
	return (
		<IconButton className="group">
			<MagneticClickWrapper {...args} />
		</IconButton>
	);
};

export const LikeButton = Template.bind({});
LikeButton.args = {
	children: <FaHeart />,
};

export const CommentButton = Template.bind({});
CommentButton.args = {
	children: <FaComment />,
};
