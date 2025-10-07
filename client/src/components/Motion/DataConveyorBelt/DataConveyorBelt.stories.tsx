import type { Meta, StoryFn } from "@storybook/react-vite";

import { DataConveyorBelt } from "./DataConveyorBelt";
import { DataConveyorBeltProps } from "./DataConveyorBelt.types";

export default {
	title: "Motion/DataConveyorBelt",
	component: DataConveyorBelt,
} satisfies Meta<typeof DataConveyorBelt>;

const Template: StoryFn<DataConveyorBeltProps> = (args) => {
	return <DataConveyorBelt {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
