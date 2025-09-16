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
			ref: "FamilyTreeMember",
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

commentSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<any, any>).populate({
		path: "author",
		select: "relationToRootMember name keyPhoto",
		populate: {
			path: "keyPhoto",
			select: "type fileKey",
		},
	});
	next();
});

export const Comment = mongoose.model("Comment", commentSchema);
