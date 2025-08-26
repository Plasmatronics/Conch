import type { Meta, StoryFn } from "@storybook/react-vite";

import { CommentThread } from "./CommentThread";
import { CommentThreadProps } from "./CommentThread.types";
import { fewReplies, longComment, manyReplies } from "../sharedCommentProps";

export default {
	title: "Comments/CommentThread",
	component: CommentThread,
} satisfies Meta<typeof CommentThread>;

const Template: StoryFn<CommentThreadProps> = (args) => {
	return <CommentThread {...args} />;
};

export const NoReplies = Template.bind({});
NoReplies.args = { comment: { comment: longComment } };

export const FewReplies = Template.bind({});
FewReplies.args = {
	comment: {
		comment: longComment,
		replies: fewReplies,
	},
};

export const ManyReplies = Template.bind({});
ManyReplies.args = {
	comment: {
		comment: longComment,
		replies: manyReplies,
	},
};
