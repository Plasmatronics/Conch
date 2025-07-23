import mongoose, { Document } from "mongoose";

interface IMemberFavThings {
	movie?: string;
	food?: string;
	restaurant?: string;
	color?: string;
	place?: string;
	decade?: string;
	person?: string;
	song?: string;
}

const memberFavoriteThingsSchema = new mongoose.Schema<IMemberFavThings>(
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

interface ILocation {
	type: "Point";
	coordinates: number[];
	address?: string;
	description?: string;
}

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

export interface IFamilyTreeMember extends Document {
	name: string;
	nicknames?: string[];
	birthLocation: ILocation;
	dateOfBirth: Date;
	dateOfDeath: Date;
	deathLocation: ILocation;
	createdAt: Date;
	relationToRootMember: string;
	favThings?: IMemberFavThings;
	stories?: mongoose.Types.ObjectId[];
	documents?: mongoose.Types.ObjectId[];
	claimedId?: mongoose.Types.ObjectId;
	images?: mongoose.Types.ObjectId[];
	keyPhoto?: mongoose.Types.ObjectId;
}

export type FamilyTreeMemberDoc = IFamilyTreeMember & Document;

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
			required: [true, "A family tree member must have a date of death"],
		},
		deathLocation: {
			type: locationSchema,
			required: [true, "A family tree member must have a death location"],
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
