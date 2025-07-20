import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
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
