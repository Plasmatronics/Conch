import type { Meta, StoryFn } from "@storybook/react-vite";

import { FacePile } from "./FacePile";
import { FacePileProps } from "./FacePile.types";
import { pileAvatars } from "./sharedFacePileStoryProps";

export default {
	title: "Elements/FacePile",
	component: FacePile,
} satisfies Meta<typeof FacePile>;

const Template: StoryFn<Omit<FacePileProps, "avatars">> = (args) => {
	return <FacePile {...args} avatars={pileAvatars} />;
};

export const JustAvatars = Template.bind({});
JustAvatars.args = {};

export const Default = Template.bind({});
Default.args = {
	text: "+3 others have commented",
};
