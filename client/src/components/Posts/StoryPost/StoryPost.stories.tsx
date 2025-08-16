import type { Meta, StoryFn } from "@storybook/react-vite";

import { StoryPost } from "./StoryPost";
import { StoryPostProps } from "./StoryPost.types";
import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { postDefaults } from "../sharedStoryProps";

export default {
	title: "Posts/StoryPost",
	component: StoryPost,
} satisfies Meta<typeof StoryPost>;

const Template: StoryFn<StoryPostProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<Box mx="5rem">
			<StoryPost
				{...postDefaults}
				{...args}
				isLiked={isLiked}
				setIsLiked={setIsLiked}
			/>
		</Box>
	);
};

export const ShortStory = Template.bind({});
ShortStory.args = {
	content:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem!",
};

export const LongStory = Template.bind({});
LongStory.args = {
	content:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt iure ipsa tenetur? Enim, quae voluptatem!",
};

export const OnLocationClick = Template.bind({});
OnLocationClick.args = {
	onLocationClick: () => {
		window.open(
			"https://www.youtube.com/watch?v=xvFZjo5PgG0",
			"_blank",
			"noopener,noreferrer",
		);
	},
	content:
		"Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt reprehenderit iure ipsa id vero cupiditate tenetur? Enim, quae voluptatem! Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea, vel nobis quod, praesentium temporibus fugiat earum delectus, fugit dolorem nesciunt iure ipsa tenetur? Enim, quae voluptatem!",
};
