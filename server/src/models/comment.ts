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
		replyingTo: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
		},
		target: {
			type: mongoose.Schema.ObjectId,
			ref: "Story",
			required: [true, "A comment must have a target post"],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		deletedAt: {
			type: Date,
			select: false,
		},
		isLikedByUser: {
			type: Boolean,
			defaault: false,
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

commentSchema.virtual("likes", {
	ref: "Like",
	localField: "_id",
	foreignField: "target",
	match: { targetType: "Comment" },
	count: true,
});

commentSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<any, any>)
		.populate({
			path: "author",
			select: "relationToRootMember name keyPhoto",
			populate: {
				path: "keyPhoto",
				select: "type fileKey",
			},
		})
		.populate({
			path: "likes",
		})
		.populate({
			path: "replyingTo",
			select: "name",
		});

	next();
});

export const Comment = mongoose.model("Comment", commentSchema);
