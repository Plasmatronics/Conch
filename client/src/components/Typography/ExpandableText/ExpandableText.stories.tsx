import type { Meta, StoryFn } from "@storybook/react-vite";

import { ExpandableText } from "./ExpandableText";
import { ExpandableTextProps } from "./ExpandableText.types";

export default {
	title: "Typography/ExpandableText",
	component: ExpandableText,
} satisfies Meta<typeof ExpandableText>;

const Template: StoryFn<ExpandableTextProps> = (args) => {
	return (
		<ExpandableText
			{...args}
			text={`There's a passage I got memorized. 
                         Ezekiel 25:17. "The path of the 
                         righteous man is beset on all sides 
                         by the inequities of the selfish and 
                         the tyranny of evil men.  Blessed is 
                         he who, in the name of charity and 
                         good will, shepherds the weak through 
                         the valley of the darkness. For he 
                         is truly his brother's keeper and 
                         the finder of lost children. And I 
                         will strike down upon thee with great 
                         vengeance and furious anger those 
                         who attempt to poison and destroy my 
                         brothers. And you will know I am the 
                         Lord when I lay my vengeance upon 
                         you." I been sayin' that shit for 
                         years.  And if you ever heard it, it 
                         meant your ass. I never really 
                         questioned what it meant. I thought 
                         it was just a coldblooded thing to 
                         say to a motherfucker 'fore you popped 
                         a cap in his ass. But I saw some 
                         shit this mornin' made me think twice. 
                         Now I'm thinkin', it could mean you're 
                         the evil man. And I'm the righteous 
                         man.  And Mr. .45 here, he's the 
                         shepherd protecting my righteous ass 
                         in the valley of darkness. Or is 
                         could by you're the righteous man 
                         and I'm the shepherd and it's the 
                         world that's evil and selfish.  I'd 
                         like that. But that shit ain't the 
                         truth. The truth is you're the weak. 
                         And I'm the tyranny of evil men. But 
                         I'm tryin'. I'm tryin' real hard to 
                         be a shepherd.`}
		/>
	);
};

export const Default = Template.bind({});
Default.args = {};

export const TenCharClamp = Template.bind({});
TenCharClamp.args = {
	maxCharCount: 10,
};

export const TextIsShorterThanClamp = Template.bind({});
TextIsShorterThanClamp.args = {
	maxCharCount: 10000,
};

export const Shrinkable = Template.bind({});
Shrinkable.args = {
	shrinkable: true,
};

export const MustClickOnTrigger = Template.bind({});
MustClickOnTrigger.args = {
	shrinkable: true,
	clickOnTextToggling: false,
};
