import type { Meta, StoryFn } from "@storybook/react-vite";

import { ConchSkeleton } from "./ConchSkeleton";
import { ConchSkeletonProps } from "./ConchSkeleton.types";
import { useState } from "react";
import { Button, Flex, Text } from "@chakra-ui/react";

export default {
	title: "Elements/ConchSkeleton",
	component: ConchSkeleton,
} satisfies Meta<typeof ConchSkeleton>;

const Template: StoryFn<ConchSkeletonProps> = (args) => {
	const [isLoading, setIsLoading] = useState(true);
	return (
		<Flex width="100%" height="100%" direction="column" gap="1rem">
			<ConchSkeleton loading={isLoading} {...args} />
			<Button onClick={() => setIsLoading((prev) => !prev)}>
				Toggle Skeleton
			</Button>
		</Flex>
	);
};

export const Default = Template.bind({});
Default.args = {
	children: <Text>Rendered Content</Text>,
};

export const Pulse = Template.bind({});
Pulse.args = {
	children: <Text>Rendered Content</Text>,
	variant: "pulse",
};
