import mongoose, { Document } from "mongoose";

export interface ILike {
	fileUrl: string;
	target: mongoose.Types.ObjectId | string;
	targetType: "Media" | "Document";
	author: mongoose.Types.ObjectId | string;
	createdAt: Date;
}

export type LikeDoc = ILike & Document;

const likeSchema = new mongoose.Schema<LikeDoc>(
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
