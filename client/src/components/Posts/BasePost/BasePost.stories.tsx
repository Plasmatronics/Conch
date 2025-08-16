import type { Meta, StoryFn } from "@storybook/react-vite";

import { BasePost } from "./BasePost";
import { BasePostProps } from "./BasePost.types";
import { AspectRatio, Box, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { TbLocationQuestion } from "react-icons/tb";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { postDefaults } from "../sharedStoryProps";

export default {
	title: "Posts/BasePost",
	component: BasePost,
} satisfies Meta<typeof BasePost>;

const Template: StoryFn<BasePostProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<Box mx="5rem">
			<BasePost
				{...postDefaults}
				{...args}
				isLiked={isLiked}
				setIsLiked={setIsLiked}
			/>
		</Box>
	);
};
export const StoryPost = Template.bind({});
StoryPost.args = {
	children: (
		<Text textStyle="sm">
			Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea?
		</Text>
	),
};

export const MediaPost = Template.bind({});
MediaPost.args = {
	children: (
		<AspectRatio>
			<iframe
				title="naruto"
				src="https://www.youtube.com/embed/QhBnZ6NPOY0"
				allowFullScreen
			/>
		</AspectRatio>
	),
};

export const WithGeoIcon = Template.bind({});
WithGeoIcon.args = {
	...StoryPost.args,
	headerRight: (
		<IconButton layerStyle="interactionButton" className="group">
			<MagneticClickWrapper asChild>
				<TbLocationQuestion />
			</MagneticClickWrapper>
		</IconButton>
	),
};
