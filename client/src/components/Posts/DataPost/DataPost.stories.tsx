import type { Meta, StoryFn } from "@storybook/react-vite";

import {
	DataPost as ConchDataPost,
	DataPostProps as ConchDataPostProps,
} from "./DataPost";

export default {
	title: "Posts/DataPost",
	component: ConchDataPost,
} satisfies Meta<typeof ConchDataPost>;

const Template: StoryFn<ConchDataPostProps> = (args) => {
	return <ConchDataPost {...args} />;
};

export const StoryWithMedia = Template.bind({});
StoryWithMedia.args = {
	storyId: "68c1db520839cb6d80289c3f",
	userId: "68d198b963d016325c3c45dd",
};
