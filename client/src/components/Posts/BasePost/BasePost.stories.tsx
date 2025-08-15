import type { Meta, StoryFn } from "@storybook/react-vite";

import { BasePost } from "./BasePost";
import { BasePostProps } from "./BasePost.types";
import { AspectRatio, Box, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import { TbLocationQuestion } from "react-icons/tb";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export default {
	title: "Posts/BasePost",
	component: BasePost,
} satisfies Meta<typeof BasePost>;

const postDefaults: Partial<BasePostProps> = {
	avatar: "https://images.unsplash.com/photo-1511806754518-53bada35f930",
	user: "Nicholas Bruno",
	relationship: "Brother",
	title:
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas adipisci eveniet distinctio minus et culpa ipsum necessitatibus",
	year: new Date(Date.now()),
};

const Template: StoryFn<BasePostProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<Box mx="5rem">
			<BasePost {...args} isLiked={isLiked} setIsLiked={setIsLiked} />
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
	...postDefaults,
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
	...postDefaults,
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
