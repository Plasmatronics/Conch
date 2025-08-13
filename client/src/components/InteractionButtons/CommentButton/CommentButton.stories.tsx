import type { Meta, StoryFn } from "@storybook/react-vite";

import { CommentButton } from "./CommentButton";
import { CommentButtonProps } from "./CommentButton.types";

export default {
	title: "InteractionButtons/CommentButton",
	component: CommentButton,
} satisfies Meta<typeof CommentButton>;

const Template: StoryFn<CommentButtonProps> = (args) => {
	return <CommentButton {...args} />;
};
export const Default = Template.bind({});
Default.args = {};
