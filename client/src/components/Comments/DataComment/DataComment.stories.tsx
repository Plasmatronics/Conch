import type { Meta, StoryFn } from "@storybook/react-vite";

import { DataComment } from "./DataComment";
import { commentDefaults } from "../sharedCommentProps";
import React from "react";

export default {
	title: "Comments/DataComment",
	component: DataComment,
} satisfies Meta<typeof DataComment>;

const Template: StoryFn<DataCommentProps> = (args) => {
	return <DataComment {...commentDefaults} {...args} />;
};

export const ShortComment = Template.bind({});
ShortComment.args = {};
