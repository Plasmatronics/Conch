import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
	{
		fileUrl: {
			type: String,
			required: [true, "A document must have a fileUrl"],
			unique: true,
		},
		type: {
			type: String,
			required: [true, "A document must have a type"],
		},
		author: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: [true, "A document must belong to a user"],
		},
		involves: {
			type: [mongoose.Schema.ObjectId],
			ref: "FamilyTreeMember",
			required: [true, "A document must have involved users"],
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

export const Document = mongoose.model("Document", documentSchema);
