import type { Meta, StoryFn } from "@storybook/react-vite";

import { FullscreenButton } from "./FullscreenButton";
import { FullscreenButtonProps } from "./FullscreenButton.types";
import { useState } from "react";

export default {
	title: "Buttons/FullscreenButton",
	component: FullscreenButton,
} satisfies Meta<typeof FullscreenButton>;

const Template: StoryFn<FullscreenButtonProps> = (args) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<FullscreenButton
			{...args}
			isExpanded={isExpanded}
			setIsExpanded={setIsExpanded}
		/>
	);
};
export const Default = Template.bind({});
Default.args = {};
