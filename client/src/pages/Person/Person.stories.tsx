import type { Meta, StoryFn } from "@storybook/react-vite";

import { Person } from "./Person";
import { PersonProps } from "./Person.types";

export default {
	title: "Pages/Person",
	component: Person,
} satisfies Meta<typeof Person>;

const Template: StoryFn<PersonProps> = (args) => {
	return <Person {...args} />;
};

export const Default = Template.bind({});
Default.args = {
	personId: "68bded593c9768d183ad7834",
	userId: "68d198b963d016325c3c45dd",
};
