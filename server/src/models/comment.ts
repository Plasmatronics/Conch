import mongoose from "mongoose";
import { CommentDoc } from "packages/shared";

const commentSchema = new mongoose.Schema<CommentDoc>(
	{
		content: {
			type: String,
			required: [true, "A comment must have some content"],
		},
		author: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "A comment must belong to a user"],
		},
		parentComment: {
			type: mongoose.Schema.ObjectId,
			ref: "Comment",
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		deletedAt: {
			type: Date,
			select: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

commentSchema.virtual("replies", {
	ref: "Comment",
	localField: "_id",
	foreignField: "parentComment",
	justOne: false,
});

export const Comment = mongoose.model("Comment", commentSchema);
