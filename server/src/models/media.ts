import mongoose, { Document } from "mongoose";

export interface IMedia {
	mediaKey: string;
	description?: string;
	type: "photo" | "video";
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export type MediaDoc = IMedia & Document;

const mediaSchema = new mongoose.Schema<MediaDoc>(
	{
		mediaKey: {
			type: String,
			required: [true, "Media must have a mediaKey"],
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
			type: [mongoose.Schema.ObjectId],
			ref: "FamilyTreeMember",
			required: [true, "Media must have involved users"],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
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

export const Media = mongoose.model("Media", mediaSchema);
