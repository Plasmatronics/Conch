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

export const FiveImagesTwoVert = Template.bind({});
FiveImagesTwoVert.args = {
	media: [
		vertImage,
		...threeHorizontalImages,
		vertVideo,
		...threeHorizontalImages,
	],
};

export const FiveImagesOneVert = Template.bind({});
FiveImagesOneVert.args = {
	media: [vertImage, ...threeHorizontalImages, ...threeHorizontalImages],
};

export const FiveImagesAllHorz = Template.bind({});
FiveImagesAllHorz.args = {
	media: [...threeHorizontalImages, ...threeHorizontalImages],
};

export const FourImagesOneVert = Template.bind({});
FourImagesOneVert.args = {
	media: [...threeHorizontalImages, vertImage],
};

export const FourImagesAllHorz = Template.bind({});
FourImagesAllHorz.args = {
	media: [...threeHorizontalImages, threeHorizontalImages[0]],
};

export const ThreeOneVert = Template.bind({});
ThreeOneVert.args = {
	media: [horizVideo, vertImage, threeHorizontalImages[0]],
};

export const ThreeAllHorz = Template.bind({});
ThreeAllHorz.args = {
	media: [...threeHorizontalImages],
};

export const TwoOneVert = Template.bind({});
TwoOneVert.args = {
	media: [threeHorizontalImages[0], vertImage],
};

export const TwoAllHorz = Template.bind({});
TwoAllHorz.args = {
	media: [horizVideo, threeHorizontalImages[1]],
};
