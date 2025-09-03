import type { Meta, StoryFn } from "@storybook/react-vite";

import { ConveyorBelt } from "./ConveyorBelt";
import { ConveyorBeltProps } from "./ConveyorBelt.types";
import { Box } from "@chakra-ui/react";

export default {
	title: "Motion/ConveyorBelt",
	component: ConveyorBelt,
} satisfies Meta<typeof ConveyorBelt>;

const Template: StoryFn<ConveyorBeltProps> = (args) => {
	return <ConveyorBelt {...args} />;
};

export const Default = Template.bind({});
Default.args = {
	children: [
		<Box bg="red" width="5rem" height="5rem" />,
		<Box bg="green" width="5rem" height="5rem" />,
		<Box bg="yellow" width="5rem" height="5rem" />,
	],
};
