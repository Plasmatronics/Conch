import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
	{
		mediaUrl: {
			type: String,
			required: [true, "Media must have a mediaUrl"],
			unique: true,
		},
		description: {
			type: String,
		},
		type: {
			type: String,
			required: [true, "Media must have a type"],
			enum: {
				values: ["photo", "video"],
				message: "Media type must be either a photo or video",
			},
		},
		author: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "Media must belong to a user"],
		},
		involves: {
			type: [mongoose.Schema.Types.ObjectId],
			ref: "FamilyTreeMember",
			required: [true, "Media must have involved users"],
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

export const Media = mongoose.model("Media", mediaSchema);
