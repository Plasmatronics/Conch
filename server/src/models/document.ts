import mongoose, { Document as MongooseDocument } from "mongoose";

export interface IDocument {
	fileKey: string;
	type: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export type DocumentDoc = IDocument & MongooseDocument;

const documentSchema = new mongoose.Schema<DocumentDoc>(
	{
		fileKey: {
			type: String,
			required: [true, "A document must have a fileKey"],
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
			required: [true, "A document must have involved tree members"],
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

export const Document = mongoose.model("Document", documentSchema);
