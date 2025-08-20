import type { Meta, StoryFn } from "@storybook/react-vite";

import { CloseButton } from "./CloseButton";
import { CloseButtonProps } from "./CloseButton.types";

export default {
	title: "Buttons/CloseButton",
	component: CloseButton,
} satisfies Meta<typeof CloseButton>;

const Template: StoryFn<CloseButtonProps> = (args) => {
	return <CloseButton {...args} />;
};
export const Default = Template.bind({});
Default.args = {};
