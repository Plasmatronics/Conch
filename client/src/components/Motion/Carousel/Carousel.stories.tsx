import type { Meta, StoryFn } from "@storybook/react-vite";

import { Carousel } from "./Carousel";
import { CarouselProps } from "./Carousel.types";
import { Box, Image } from "@chakra-ui/react";
import { useState } from "react";

export default {
	title: "Motion/Carousel",
	component: Carousel,
} satisfies Meta<typeof Carousel>;

const Template: StoryFn<CarouselProps> = (args) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	return (
		<Box mx="5rem">
			<Carousel
				{...args}
				currentIndex={currentIndex}
				setCurrentIndex={setCurrentIndex}
			/>
		</Box>
	);
};

export const Default = Template.bind({});
Default.args = {
	children: [
		<Image src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630" />,
		<Image src="https://i.pinimg.com/736x/2d/95/e5/2d95e5886fc4c65a6778b5fee94a7d59.jpg" />,
		<Image src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630" />,
		<Image src="https://i.pinimg.com/736x/2d/95/e5/2d95e5886fc4c65a6778b5fee94a7d59.jpg" />,
		<Image src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630" />,
	],
};
