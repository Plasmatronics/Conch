export const mockFileUrl =
	"https://www.hoodedutilitarian.com/wp-content/uploads/2015/08/foxylady.jpg";

export const mockMediaData = {
	id: "68bdedc63c9768d183ad7839",
	fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
	type: "image",
	author: "68bded593c9768d183ad7834",
	involves: ["68bded593c9768d183ad7834"],
};

export const mockCommentOne = {
	id: "687f19fe77c2242b69f1f261",
	content: "This is the best post ever",
	author: "68bded593c9768d183ad7834",
};

export const mockCommentTwo = {
	id: "687f19fe77c2242b69f1f261",
	content: "This is the best post ever",
	author: "68bded593c9768d183ad7834",
	parentComment: "687f19fe77c2242b69f1f261",
};

export const mockMemberData = {
	_id: "68bded593c9768d183ad7834",
	name: "Joseph Bruno",
	nicknames: ["Joey"],
	birthLocation: {
		type: "Point",
		coordinates: [-73.8648, 40.8448],
		address: "Bronx, New York, USA",
		description: "Born in the Bronx",
	},
	dateOfBirth: "2001-06-15T00:00:00.000Z",
	relationToRootMember: "Brother",
	favThings: {
		movie: "Toy Story",
		food: "Mac and Cheese",
		restaurant: "Chuck E. Cheese",
		color: "Red",
		place: "Local Playground",
		decade: "2000s",
		person: "Big Bird",
		song: "The Wheels on the Bus",
	},
	__v: 0,
	keyPhoto: "68bdedc63c9768d183ad7839",
	id: "68bded593c9768d183ad7834",
};

export const mockStoriesData = [
	{
		_id: "68bf2a9895bde97c33918cef",
		title: "French Fries",
		content:
			"Joey sat on the wooden bench at the edge of the park, his small hands clutching a warm paper tray. The smell of crispy French fries rose into the late afternoon air, drifting toward the children playing nearby. Joey loved fries—golden, salty, familiar. He lined them up carefully, one by one, the way he liked to make sense of things, then took a bite. Each crunch was steady, grounding him in a world that sometimes felt too loud. His mother watched from beside him, smiling as he looked up at the sun and popped another fry into his mouth. For Joey, this was more than just a snack—it was comfort, order, and a moment of joy.",
		author: "68bded593c9768d183ad7834",
		involves: ["68bded593c9768d183ad7834"],
		storyDate: "2025-09-08T00:00:00.000Z",
		id: "68bf2a9895bde97c33918cef",
	},
	{
		_id: "68c1db520839cb6d80289c3f",
		title: "I Like Pigs",
		content: "Pigs are great",
		author: "68bded593c9768d183ad7834",
		involves: ["68bded593c9768d183ad7834", "64f1586f28c96e3d47b4d0e5"],
		media: ["68bdedc63c9768d183ad7839"],
		storyDate: "2024-08-14T00:00:00.000Z",
		id: "68c1db520839cb6d80289c3f",
	},
];

type Member = typeof mockMemberData;
export type MemberWithStories = Member & { stories: typeof mockStoriesData };
export type MemberResponse = Member | MemberWithStories;
