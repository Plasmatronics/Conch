import type { Meta, StoryFn } from "@storybook/react-vite";

import { CommentSection } from "./CommentSection";
import { CommentSectionProps } from "./CommentSection.types";
import { fewReplies, longComment, manyReplies } from "../sharedCommentProps";

export default {
	title: "Comments/CommentSection",
	component: CommentSection,
} satisfies Meta<typeof CommentSection>;

const Template: StoryFn<CommentSectionProps> = (args) => {
	return <CommentSection {...args} />;
};

export const OneThread = Template.bind({});
OneThread.args = {
	commentThreads: [
		{
			comment: {
				comment: longComment,
				replies: fewReplies,
			},
		},
	],
};

export const FewThreads = Template.bind({});
FewThreads.args = {
	commentThreads: [
		{
			comment: {
				comment: longComment,
				replies: fewReplies,
			},
		},
		{
			comment: {
				comment: longComment,
				replies: manyReplies,
			},
		},
	],
};

export const ManyThreads = Template.bind({});
ManyThreads.args = {
	commentThreads: [
		{
			comment: {
				comment: longComment,
				replies: fewReplies,
			},
		},
		{
			comment: {
				comment: longComment,
				replies: manyReplies,
			},
		},
		{
			comment: {
				comment: longComment,
				replies: manyReplies,
			},
		},
		{
			comment: {
				comment: longComment,
				replies: fewReplies,
			},
		},
	],
};
