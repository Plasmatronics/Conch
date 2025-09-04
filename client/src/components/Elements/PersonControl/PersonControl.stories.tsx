import type { Meta, StoryFn } from "@storybook/react-vite";

import { PersonControl } from "./PersonControl";
import { PersonControlProps } from "./PersonControl.types";

export default {
	title: "Elements/PersonControl",
	component: PersonControl,
} satisfies Meta<typeof PersonControl>;

const Template: StoryFn<PersonControlProps> = (args) => {
	return <PersonControl {...args} />;
};

export const Default = Template.bind({});
Default.args = {};

export const Styled = Template.bind({});
Styled.args = {
	bg: "purple.900",
	activeStyles: {
		color: "purple.900",
	},
};
