import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
	{
		fileUrl: {
			type: String,
			required: [true, "A like must have a fileUrl"],
			unique: true,
		},
		target: {
			type: mongoose.Schema.ObjectId,
			required: [true, "A like must have a target"],
			ref: "targetType",
		},
		targetType: {
			type: String,
			required: [true, "A like must have a target type"],
			enum: ["Media", "Document"],
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
