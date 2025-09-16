import mongoose from "mongoose";
import { StoryDoc } from "packages/shared";

const storySchema = new mongoose.Schema<StoryDoc>(
	{
		title: {
			type: String,
			required: [true, "A story must have a title"],
			unique: true,
			maxlength: [30, "A story title musn't exceed 30 characters."],
			minlength: [7, "A story title must exceed 7 characters."],
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
		involves: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "FamilyTreeMember",
				required: true,
			},
		],
		media: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Media",
			},
		],
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		deletedAt: {
			type: Date,
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

storySchema.pre(/^find/, function (next) {
	(this as mongoose.Query<any, any>).populate({
		path: "author",
		select: "relationToRootMember name keyPhoto",
		populate: {
			path: "media",
			select: "type fileKey",
		},
	});
	next();
});

export const Story = mongoose.model("Story", storySchema);
