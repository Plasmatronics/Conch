import mongoose from "mongoose";

const favThingsSchema = new mongoose.Schema(
	{
		movie: { type: String },
		food: { type: String },
		restaurant: { type: String },
		color: { type: String },
		place: { type: String },
		decade: { type: String },
		person: { type: String },
		song: { type: String },
	},
	{ _id: false },
);

const familyTreeMemberSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "A family tree member must have a name"],
			unique: true,
			trim: true,
			maxlength: [30, "A name musn't exceed 30 characters."],
			minlength: [7, "A name must exceed 7 characters."],
		},
		nicknames: {
			type: [String],
		},
		birthLocation: {
			type: {
				type: String,
				default: "Point",
				enum: ["Point"],
			},
			coordinates: [Number],
			address: String,
			description: String,
			required: [true, "A family tree member must have a birth location"],
		},
		dateOfBirth: {
			type: Date,
			required: [true, "A family tree member must have a DOB"],
		},
		dateOfDeath: {
			type: Date,
			required: [true, "A family tree member must have a date of death"],
		},
		deathLocation: {
			type: {
				type: String,
				default: "Point",
				enum: ["Point"],
			},
			coordinates: [Number],
			address: String,
			description: String,
			required: [true, "A family tree member must have a death location"],
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		relationtoRootMember: {
			type: String,
			required: [
				true,
				"A family tree member must have a connection to root member",
			],
		},
		favThiings: {
			type: favThingsSchema,
		},
		stories: { type: [mongoose.Schema.ObjectId], ref: "Story" },
		documents: { type: [mongoose.Schema.ObjectId], ref: "Document" },
		claimedId: { type: mongoose.Schema.ObjectId, ref: "User" },
		images: {
			type: [mongoose.Schema.ObjectId],
			ref: "Media",
		},
		keyPhoto: {
			type: mongoose.Schema.ObjectId,
			ref: "Media",
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

export const FamilyTreeMember = mongoose.model(
	"FamilyTreeMember",
	familyTreeMemberSchema,
);
