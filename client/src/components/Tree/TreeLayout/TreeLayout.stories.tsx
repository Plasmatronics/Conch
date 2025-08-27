import type { Meta, StoryFn } from "@storybook/react-vite";

import { TreeLayout } from "./TreeLayout";
import { TreeLayoutProps } from "./TreeLayout.types";

export default {
	title: "Tree/TreeLayout",
	component: TreeLayout,
} satisfies Meta<typeof TreeLayout>;

const Template: StoryFn<TreeLayoutProps> = (args) => {
	return <TreeLayout {...args} />;
};

export const Default = Template.bind({});
Default.args = {};
