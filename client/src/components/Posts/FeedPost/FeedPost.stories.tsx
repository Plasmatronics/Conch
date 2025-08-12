import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeedPost } from "./FeedPost";

const meta = {
	component: FeedPost,
} satisfies Meta<typeof FeedPost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {},
};
