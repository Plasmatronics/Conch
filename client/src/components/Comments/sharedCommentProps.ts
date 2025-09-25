import { BaseCommentProps } from "./BaseComment";

export const commentDefaults: Omit<BaseCommentProps, "comment"> = {
	avatar: "https://images.unsplash.com/photo-1511806754518-53bada35f930",
	user: "Nicholas Bruno",
	relationship: "Brother",
	numLikes: 12,
	datePosted: new Date(2025, 7, 25, 19, 0, 0), // August 25, 2025 7:00pm
};

export const shortComment = {
	...commentDefaults,
	comment: "This is so true!",
};

export const longComment = {
	...commentDefaults,
	comment: `Although General William Howe landed his forces at Frog’s Neck (modern Throgg’s Neck) on October 12, 1776, intending to march north and cut off George Washington’s army retreating from Manhattan, this map reveals why his plan stalled almost immediately.
If you look closely at the map, you’ll notice the narrow causeway across the salt marsh at Westchester Creek. That thin crossing was the only land route from the Neck to the mainland. Washington’s forces had quickly destroyed the bridge and fortified the far bank.
As a result, despite having more than 4,000 troops and 5,000 sailors, Howe’s army was effectively trapped on the peninsula. The marshy terrain—so carefully drawn by Charles Blaskowitz—turned into a natural defense. The British were forced to sit idle for nearly a week, shelling across the creek, until they re-embarked and shifted their invasion north to Pell’s Point (Pelham Bay), where fighting resumed on October 18.`,
};

export const fewReplies = [
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
];

export const manyReplies = [
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
	{
		comment: { ...shortComment, replyToName: commentDefaults.user },
		replyingTo: commentDefaults.user,
	},
];
