import mongoose from "mongoose";
import { LikeDoc } from "packages/shared";

const likeSchema = new mongoose.Schema<LikeDoc>(
	{
		fileKey: {
			type: mongoose.Schema.ObjectId,
			ref: "Media",
			required: [true, "A like must have a fileKey"],
		},
		target: {
			type: mongoose.Schema.ObjectId,
			required: [true, "A like must have a target"],
			ref: "targetType",
		},
		targetType: {
			type: String,
			required: [true, "A like must have a target type"],
			enum: ["Story", "Document", "Comment"],
		},
		author: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "A like must belong to a user"],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const Like = mongoose.model("Like", likeSchema);
