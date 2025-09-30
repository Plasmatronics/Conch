import type { Meta, StoryFn } from "@storybook/react-vite";

import { DataTreeLayout } from "./DataTreeLayout";
import { DataTreeLayoutProps } from "./DataTreeLayout.types";

export default {
	title: "Tree/DataTreeLayout",
	component: DataTreeLayout,
} satisfies Meta<typeof DataTreeLayout>;

const Template: StoryFn<DataTreeLayoutProps> = (args) => {
	return <DataTreeLayout {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
