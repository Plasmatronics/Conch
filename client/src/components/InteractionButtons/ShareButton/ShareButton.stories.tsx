import type { Meta, StoryFn } from "@storybook/react-vite";

import { ShareButton } from "./ShareButton";
import { ShareButtonProps } from "./ShareButton.types";

export default {
	title: "InteractionButtons/ShareButton",
	component: ShareButton,
} satisfies Meta<typeof ShareButton>;

const Template: StoryFn<ShareButtonProps> = (args) => {
	return <ShareButton {...args} />;
};
export const Default = Template.bind({});
Default.args = {};
