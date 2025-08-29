import type { Meta, StoryFn } from "@storybook/react-vite";

import { TreeLayout } from "./TreeLayout";
import { TreeLayoutProps } from "./TreeLayout.types";
import { threeCards } from "../sharedTreeProps";
import { MemberData } from "../TreeCard";

export default {
	title: "Tree/TreeLayout",
	component: TreeLayout,
} satisfies Meta<typeof TreeLayout>;

const Template: StoryFn<TreeLayoutProps> = (args) => {
	return <TreeLayout {...args} />;
};

const defaultdata: Omit<MemberData, "name"> = {
	birthYear: 1973,
	numMemories: 1,
	image:
		"https://m.media-amazon.com/images/M/MV5BMTE5MjM5MzM3M15BMl5BanBnXkFtZTYwOTEzOTY0._V1_.jpg",
};

export const MiniTree = Template.bind({});
MiniTree.args = {
	people: {
		Roberta: {
			content: {
				memberData: { ...threeCards[0] },
			},
		},
		Ray: {
			content: {
				memberData: { ...threeCards[1] },
			},
		},
		Aggie: {
			content: {
				memberData: { ...threeCards[2] },
			},
		},
		Mike: {
			content: {
				memberData: {
					name: "Mike Quinones",
					...defaultdata,
				},
			},
		},
		Frankie: {
			content: {
				memberData: {
					name: "Frankie Carpenter",
					...defaultdata,
				},
			},
		},
		Chris: {
			content: {
				memberData: {
					name: "Chris Ramos",
					...defaultdata,
				},
			},
		},
		Denise: {
			content: {
				memberData: {
					name: "Denise Finelli",
					...defaultdata,
				},
			},
		},
		Ava: {
			content: {
				memberData: {
					name: "Ava Carpenter",
					...defaultdata,
				},
			},
		},
		Kayla: {
			content: {
				memberData: {
					name: "Kayla Quinones",
					...defaultdata,
				},
			},
		},
	},
	marriages: [
		{
			descendantId: "Roberta",
			spouseIds: ["Ray"],
		},
		{
			descendantId: "Aggie",
			spouseIds: ["Frankie", "Mike"],
		},
		{
			descendantId: "Chris",
			spouseIds: ["Denise"],
		},
	],
	parentChild: [
		{
			parentId: "Roberta",
			childIds: ["Aggie", "Chris"],
		},
		{
			parentId: "Ray",
			childIds: ["Aggie", "Chris"],
		},
		{
			parentId: "Aggie",
			childIds: ["Ava", "Kayla"],
		},
		{
			parentId: "Mike",
			childIds: ["Kayla"],
		},
		{
			parentId: "Frankie",
			childIds: ["Ava"],
		},
	],
};
