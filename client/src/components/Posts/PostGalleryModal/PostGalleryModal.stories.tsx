import type { Meta, StoryFn } from "@storybook/react-vite";

import { PostGalleryModal } from "./PostGalleryModal";
import { PostGalleryModalProps } from "./PostGalleryModal.types";
import {
	threeHorizontalImages,
	vertImage,
	vertVideo,
} from "../sharedStoryProps";
import { Box } from "@chakra-ui/react";

export default {
	title: "Posts/PostGalleryModal",
	component: PostGalleryModal,
} satisfies Meta<typeof PostGalleryModal>;

const Template: StoryFn<PostGalleryModalProps> = (args) => {
	return (
		<PostGalleryModal {...args} rightSection={<Box height="200%" bg="red" />} />
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
