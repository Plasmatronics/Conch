import mongoose, { Document } from "mongoose";

export interface IComment {
	content: string;
	author: mongoose.Types.ObjectId;
	parentComment?: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt?: Date;
}

export type CommentDoc = IComment & Document;

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

export const Comment = mongoose.model("Comment", commentSchema);
