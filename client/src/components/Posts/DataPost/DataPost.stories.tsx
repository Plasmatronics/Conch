import type { Meta, StoryFn } from "@storybook/react-vite";

import { useState } from "react";
import {
	DataPost as ConchDataPost,
	DataPostProps as ConchDataPostProps,
} from "./DataPost";

export default {
	title: "Posts/DataPost",
	component: ConchDataPost,
} satisfies Meta<typeof ConchDataPost>;

const Template: StoryFn<ConchDataPostProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return <ConchDataPost {...args} isLiked={isLiked} setIsLiked={setIsLiked} />;
};

export const ShortStoryNoMedia = Template.bind({});
ShortStoryNoMedia.args = {
	storyId: "68bf2a9895bde97c33918cef",
	personId: "68bded593c9768d183ad7834",
};

export const StoryWithMedia = Template.bind({});
StoryWithMedia.args = {
	storyId: "68c1db520839cb6d80289c3f",
	personId: "68bded593c9768d183ad7834",
};
