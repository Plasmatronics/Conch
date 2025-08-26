import type { Meta, StoryFn } from "@storybook/react-vite";

// import { BaseCommentSkeleton } from "./BaseCommentSkeleton";
import { BaseComment } from "./BaseComment";
import { BaseCommentProps } from "./BaseComment.types";
import { Box } from "@chakra-ui/react";
import { commentDefaults } from "../sharedCommentProps";

export default {
	title: "Comments/BaseComment",
	component: BaseComment,
} satisfies Meta<typeof BaseComment>;

const Template: StoryFn<BaseCommentProps> = (args) => {
	return <BaseComment {...commentDefaults} {...args} />;
};

export const ShortComment = Template.bind({});
ShortComment.args = {
	comment:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia?",
};

export const LongComment = Template.bind({});
LongComment.args = {
	comment:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia?",
};

export const UnrenderedReplies = Template.bind({});
UnrenderedReplies.args = {
	comment:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia?",
	numReplies: 41,
};

export const CurrentDate = Template.bind({});
CurrentDate.args = {
	comment:
		"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Saepe consequuntur ipsa odio voluptas voluptatem maxime ut sit, iusto nam vero error voluptates dignissimos animi nesciunt sed inventore assumenda nemo officia?",
	datePosted: new Date(),
};

export const CommentSkeleton = () => {
	return <Box />;
};
