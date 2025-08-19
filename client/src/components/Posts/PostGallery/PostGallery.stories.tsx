import type { Meta, StoryFn } from "@storybook/react-vite";

import { PostGallery } from "./PostGallery";
import { PostGalleryProps } from "./PostGallery.types";
import { Box } from "@chakra-ui/react";
import {
	threeHorizontalImages,
	vertImage,
	vertVideo,
	horizVideo,
} from "../sharedStoryProps";

export default {
	title: "Posts/PostGallery",
	component: PostGallery,
} satisfies Meta<typeof PostGallery>;

const Template: StoryFn<PostGalleryProps> = (args) => {
	return (
		<Box mx="5rem">
			<PostGallery {...args} />
		</Box>
	);
};

export const FiveMediaTwoVert = Template.bind({});
FiveMediaTwoVert.args = {
	media: [
		vertImage,
		...threeHorizontalImages,
		vertVideo,
		...threeHorizontalImages,
	],
};

export const FiveMediaOneVert = Template.bind({});
FiveMediaOneVert.args = {
	media: [vertImage, ...threeHorizontalImages, ...threeHorizontalImages],
};

export const FiveMediaAllHorz = Template.bind({});
FiveMediaAllHorz.args = {
	media: [...threeHorizontalImages, ...threeHorizontalImages],
};

export const FourMediaOneVert = Template.bind({});
FourMediaOneVert.args = {
	media: [...threeHorizontalImages, vertImage],
};

export const FourMediaAllHorz = Template.bind({});
FourMediaAllHorz.args = {
	media: [...threeHorizontalImages, threeHorizontalImages[0]],
};

export const ThreeMediaOneVert = Template.bind({});
ThreeMediaOneVert.args = {
	media: [horizVideo, vertImage, threeHorizontalImages[0]],
};

export const ThreeMediaAllHorz = Template.bind({});
ThreeMediaAllHorz.args = {
	media: [...threeHorizontalImages],
};

export const TwoMediaOneVert = Template.bind({});
TwoMediaOneVert.args = {
	media: [threeHorizontalImages[0], vertImage],
};

export const TwoMediaAllHorz = Template.bind({});
TwoMediaAllHorz.args = {
	media: [horizVideo, threeHorizontalImages[1]],
};
