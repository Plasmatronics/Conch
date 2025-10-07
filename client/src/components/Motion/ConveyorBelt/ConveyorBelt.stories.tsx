import type { Meta, StoryFn } from "@storybook/react-vite";

import { ConveyorBelt } from "./ConveyorBelt";
import { ConveyorBeltProps } from "./ConveyorBelt.types";
import { Box, Flex } from "@chakra-ui/react";

export default {
	title: "Motion/ConveyorBelt",
	component: ConveyorBelt,
} satisfies Meta<typeof ConveyorBelt>;

const Template: StoryFn<ConveyorBeltProps> = (args) => {
	return <ConveyorBelt {...args} />;
};

export const ReverseDirection = Template.bind({});
ReverseDirection.args = {
	children: [<Box bg="red" width="5rem" height="5rem" />],
	direction: "left",
};

export const OneChild = Template.bind({});
OneChild.args = {
	children: [<Box bg="red" width="5rem" height="5rem" />],
};

export const SomeChildren = Template.bind({});
SomeChildren.args = {
	children: [
		<Box bg="red" width="5rem" height="5rem" />,
		<Box bg="green" width="5rem" height="5rem" />,
		<Box bg="yellow" width="5rem" height="5rem" />,
	],
};

export const ManyChildren = Template.bind({});
ManyChildren.args = {
	children: [
		<Box bg="orange" width="5rem" height="5rem" />,
		<Box bg="green" width="5rem" height="5rem" />,
		<Box bg="purple" width="5rem" height="5rem" />,
		<Box bg="red" width="5rem" height="5rem" />,
		<Box bg="black" width="5rem" height="5rem" />,
		<Box bg="yellow" width="5rem" height="5rem" />,
	],
};

export const ManyMany = Template.bind({});
ManyMany.args = {
	children: [
		<Box bg="orange" width="5rem" height="5rem" />,
		<Box bg="orange" width="5rem" height="5rem" />,
		<Box bg="green" width="5rem" height="5rem" />,
		<Box bg="green" width="5rem" height="5rem" />,
		<Box bg="purple" width="5rem" height="5rem" />,
		<Box bg="purple" width="5rem" height="5rem" />,
		<Box bg="red" width="5rem" height="5rem" />,
		<Box bg="red" width="5rem" height="5rem" />,
		<Box bg="black" width="5rem" height="5rem" />,
		<Box bg="black" width="5rem" height="5rem" />,
		<Box bg="yellow" width="5rem" height="5rem" />,
		<Box bg="yellow" width="5rem" height="5rem" />,
	],
};
export const SideBySide = () => {
	return (
		<Flex width="100%">
			<ConveyorBelt flexBasis="50%" zIndex="max">
				<Box bg="orange" width="5rem" height="5rem" />
				<Box bg="green" width="5rem" height="5rem" />
				<Box bg="purple" width="5rem" height="5rem" />
				<Box bg="red" width="5rem" height="5rem" />
				<Box bg="black" width="5rem" height="5rem" />
				<Box bg="yellow" width="5rem" height="5rem" />
			</ConveyorBelt>
			<Box bg="red.700" flexBasis="50%" />
		</Flex>
	);
};
