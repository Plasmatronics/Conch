import mongoose from "mongoose";
import { FamilyTreeMemberDoc, ILocation, MemberFavThings } from "@conch/shared";

const memberFavoriteThingsSchema = new mongoose.Schema<MemberFavThings>(
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

const locationSchema = new mongoose.Schema<ILocation>(
	{
		type: {
			type: String,
			enum: ["Point"],
			default: "Point",
		},
		coordinates: {
			type: [Number],
			required: true,
		},
		address: String,
		description: String,
	},
	{ _id: false },
);

const familyTreeMemberSchema = new mongoose.Schema<FamilyTreeMemberDoc>(
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
			type: locationSchema,
			required: [true, "A family tree member must have a birth location"],
		},
		dateOfBirth: {
			type: Date,
			required: [true, "A family tree member must have a DOB"],
		},
		dateOfDeath: {
			type: Date,
		},
		deathLocation: {
			type: locationSchema,
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		relationToRootMember: {
			type: String,
			required: [
				true,
				"A family tree member must have a connection to root member",
			],
		},
		favThings: {
			type: memberFavoriteThingsSchema,
		},
		claimedId: { type: mongoose.Schema.ObjectId, ref: "User" },
		keyPhoto: {
			type: mongoose.Schema.ObjectId,
			ref: "Media",
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

familyTreeMemberSchema.virtual("stories", {
	ref: "Story",
	localField: "_id",
	foreignField: "involves",
	justOne: false,
});

familyTreeMemberSchema.pre(/^find/, function (next) {
	(this as mongoose.Query<any, any>).populate({
		path: "keyPhoto",
		select: "type fileKey",
	});
	next();
});

export const FamilyTreeMember = mongoose.model(
	"FamilyTreeMember",
	familyTreeMemberSchema,
);
