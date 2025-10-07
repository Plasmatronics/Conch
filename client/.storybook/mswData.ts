import {
	HydratedFamilyTreeMemberDTO,
	HydratedMediaDTO,
	PopulatedStoryDTO,
	PopulatedCommentDTO,
	HydratedLikeDTO,
	PopulatedFamilyTreeMemberDTOWithStoryCount,
} from "@conch/shared";

export const mockFileUrl =
	"https://www.hoodedutilitarian.com/wp-content/uploads/2015/08/foxylady.jpg";

export const mockMediaData: HydratedMediaDTO = {
	id: "68bdedc63c9768d183ad7839",
	fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
	type: "image",
	author: "68bded593c9768d183ad7834",
	involves: ["68bded593c9768d183ad7834"],
};

export const mockParentComment: PopulatedCommentDTO = {
	_id: "68c3429ba477ed0dad6f5fbe",
	content: "This is a really helpful post, thanks for sharing!",
	target: "68bf2a9895bde97c33918cef",
	likes: 0,
	author: {
		_id: "68bded593c9768d183ad7834",
		name: "Joseph Bruno",
		relationToRootMember: "Brother",
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		id: "68bded593c9768d183ad7834",
	},
	createdAt: new Date("2025-09-11T21:43:11.882Z"),
	__v: 0,
	id: "68c3429ba477ed0dad6f5fbe",
};

export const mockChildComment: PopulatedCommentDTO = {
	_id: "68c345abc2eada301a2a38f8",
	content: "What?? This post is terrible!",
	target: "68bf2a9895bde97c33918cef",
	likes: 0,
	replyingTo: {
		id: "68c3429ba477ed0dad6f5fbe",
		name: "Joseph Bruno",
	},
	author: {
		_id: "68bded593c9768d183ad7834",
		name: "Joseph Bruno",
		relationToRootMember: "Brother",
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		id: "68bded593c9768d183ad7834",
	},
	parentComment: "68c3429ba477ed0dad6f5fbe",
	createdAt: new Date("2025-09-11T21:55:00.721Z"),
	id: "68c345abc2eada301a2a38f8",
};

export const mockMemberData: HydratedFamilyTreeMemberDTO = {
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
	keyPhoto: {
		_id: "68bdedc63c9768d183ad7839",
		fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
		type: "image",
		id: "68bdedc63c9768d183ad7839",
	},
	id: "68bded593c9768d183ad7834",
};

export const mockMediaPopulatedStoryData: PopulatedStoryDTO = {
	media: [
		{
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
	],
	_id: "68bf2a9895bde97c33918cef",
	title: "French Fries",
	content:
		"Joey sat on the wooden bench at the edge of the park, his small hands clutching a warm paper tray. The smell of crispy French fries rose into the late afternoon air, drifting toward the children playing nearby. Joey loved fries—golden, salty, familiar. He lined them up carefully, one by one, the way he liked to make sense of things, then took a bite. Each crunch was steady, grounding him in a world that sometimes felt too loud. His mother watched from beside him, smiling as he looked up at the sun and popped another fry into his mouth. For Joey, this was more than just a snack—it was comfort, order, and a moment of joy.",
	author: {
		_id: "68bded593c9768d183ad7834",
		name: "Joseph Bruno",
		relationToRootMember: "Brother",
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		id: "68bded593c9768d183ad7834",
	},
	involves: ["68bded593c9768d183ad7834"],
	createdAt: "2025-09-08T18:56:30.673Z",
	storyDate: "2025-09-08T00:00:00.000Z",
	__v: 0,
	id: "68bf2a9895bde97c33918cef",
};

export const userData = {
	_id: "68d198b963d016325c3c45dd",
	name: "Nicholas Bruno",
	email: "nicholaskgp@gmail.com",
	__v: 0,
	id: "68d198b963d016325c3c45dd",
	familyTreeMember: mockMemberData,
};

export const postLikeData: HydratedLikeDTO = {
	author: "68d198b963d016325c3c45dd",
	targetType: "Story",
	target: "68bf2a9895bde97c33918cef",
	_id: "68d1a8b963d016325c3c45de",
	__v: 0,
	id: "68d1a8b963d016325c3c45de",
	createdAt: "2025-09-08T19:00:00.000Z",
};

export const commentLikeData: HydratedLikeDTO = {
	author: "68d198b963d016325c3c45dd",
	targetType: "Comment",
	target: "68c345abc2eada301a2a38f8",
	_id: "68d1a8b963d016325c3c45df",
	__v: 0,
	id: "68d1a8b963d016325c3c45df",
	createdAt: "2025-09-08T19:05:00.000Z",
};

export const mockAllMembers: PopulatedFamilyTreeMemberDTOWithStoryCount[] = [
	{
		id: "1",
		name: "John Doe",
		nicknames: ["Johnny"],
		dateOfBirth: new Date("1960-01-01"),
		createdAt: new Date(),
		stories: [],
		storiesCount: 2,
		spouses: [{ id: "2", name: "Jane Smith" }],
		children: [
			{ id: "3", name: "Alice Doe" },
			{ id: "4", name: "Bob Doe" },
		],
		dated: [],
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		bestFriend: null,
		relationToRootMember: "self",
	},
	{
		id: "2",
		name: "Jane Smith",
		dateOfBirth: new Date("1962-05-15"),
		createdAt: new Date(),
		stories: [],
		storiesCount: 1,
		spouses: [{ id: "1", name: "John Doe" }],
		children: [
			{ id: "3", name: "Alice Doe" },
			{ id: "4", name: "Bob Doe" },
		],
		dated: [],
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		bestFriend: null,
		relationToRootMember: "spouse",
	},
	{
		id: "3",
		name: "Alice Doe",
		dateOfBirth: new Date("1985-03-20"),
		createdAt: new Date(),
		stories: [],
		storiesCount: 0,
		spouses: [],
		children: [],
		dated: [],
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		bestFriend: null,
		relationToRootMember: "daughter",
	},
	{
		id: "4",
		name: "Bob Doe",
		dateOfBirth: new Date("1988-07-10"),
		createdAt: new Date(),
		stories: [],
		storiesCount: 0,
		spouses: [],
		children: [],
		dated: [],
		keyPhoto: {
			_id: "68bdedc63c9768d183ad7839",
			fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
			type: "image",
			id: "68bdedc63c9768d183ad7839",
		},
		bestFriend: null,
		relationToRootMember: "son",
	},
];

export const memberAndStoriesAndCommentsData = {
	...mockMemberData,
	stories: [
		{
			media: [
				{
					_id: "68bdedc63c9768d183ad7839",
					fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
					type: "image",
					id: "68bdedc63c9768d183ad7839",
				},
			],
			_id: "68bf2a9895bde97c33918cef",
			title: "French Fries",
			content:
				"Joey sat on the wooden bench at the edge of the park, his small hands clutching a warm paper tray. The smell of crispy French fries rose into the late afternoon air, drifting toward the children playing nearby. Joey loved fries—golden, salty, familiar. He lined them up carefully, one by one, the way he liked to make sense of things, then took a bite. Each crunch was steady, grounding him in a world that sometimes felt too loud. His mother watched from beside him, smiling as he looked up at the sun and popped another fry into his mouth. For Joey, this was more than just a snack—it was comfort, order, and a moment of joy.",
			author: {
				_id: "68bded593c9768d183ad7834",
				name: "Joseph Bruno",
				relationToRootMember: "Brother",
				keyPhoto: {
					_id: "68bdedc63c9768d183ad7839",
					fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
					type: "image",
					id: "68bdedc63c9768d183ad7839",
				},
				id: "68bded593c9768d183ad7834",
			},
			involves: ["68bded593c9768d183ad7834"],
			createdAt: "2025-09-08T18:56:30.673Z",
			storyDate: "2025-09-08T00:00:00.000Z",
			__v: 0,
			id: "68bf2a9895bde97c33918cef",
			comments: [{ ...mockParentComment, replies: [{ ...mockChildComment }] }],
		},
		{
			media: [
				{
					_id: "68bdedc63c9768d183ad7839",
					fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
					type: "image",
					id: "68bdedc63c9768d183ad7839",
				},
			],
			_id: "68bf2a9895bde97c33918cef",
			title: "French Fries",
			content:
				"Joey sat on the wooden bench at the edge of the park, his small hands clutching a warm paper tray. The smell of crispy French fries rose into the late afternoon air, drifting toward the children playing nearby. Joey loved fries—golden, salty, familiar. He lined them up carefully, one by one, the way he liked to make sense of things, then took a bite. Each crunch was steady, grounding him in a world that sometimes felt too loud. His mother watched from beside him, smiling as he looked up at the sun and popped another fry into his mouth. For Joey, this was more than just a snack—it was comfort, order, and a moment of joy.",
			author: {
				_id: "68bded593c9768d183ad7834",
				name: "Joseph Bruno",
				relationToRootMember: "Brother",
				keyPhoto: {
					_id: "68bdedc63c9768d183ad7839",
					fileKey: "243e4552-c3ec-401f-88fa-bda7d9b5d81e",
					type: "image",
					id: "68bdedc63c9768d183ad7839",
				},
				id: "68bded593c9768d183ad7834",
			},
			involves: ["68bded593c9768d183ad7834"],
			createdAt: "2025-09-08T18:56:30.673Z",
			storyDate: "2025-09-08T00:00:00.000Z",
			__v: 0,
			id: "68bf2a9895bde97c33918cef",
			comments: [{ ...mockParentComment, replies: [{ ...mockChildComment }] }],
		},
	],
};
