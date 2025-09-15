import type { Meta, StoryFn } from "@storybook/react-vite";

import { DataComment, DataCommentProps } from "./DataComment";
import React from "react";

export default {
	title: "Comments/DataComment",
	component: DataComment,
} satisfies Meta<typeof DataComment>;

const Template: StoryFn<DataCommentProps> = (args) => {
	return <DataComment {...args} />;
};

export const OneReply = Template.bind({});
OneReply.args = {
	commentId: "687f19fe77c2242b69f1f269",
};
