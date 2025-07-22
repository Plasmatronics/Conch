import mongoose, { Document } from "mongoose";

export interface IStory {
	title: string;
	content: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	storyDate?: Date;
}

export type StoryDoc = IStory & Document;

const storySchema = new mongoose.Schema<StoryDoc>(
	{
		title: {
			type: String,
			required: [true, "A story must have a title"],
			unique: true,
			maxlength: [30, "A story musn't exceed 30 characters."],
			minlength: [7, "A story must exceed 7 characters."],
		},
		content: {
			type: String,
			required: [true, "A story must have some content"],
			unique: true,
		},
		author: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "A story must belong to a user"],
		},
		involves: {
			type: [mongoose.Schema.ObjectId],
			ref: "FamilyTreeMember",
			required: [true, "A story must have involved users"],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		storyDate: {
			type: Date,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const Story = mongoose.model("Story", storySchema);
