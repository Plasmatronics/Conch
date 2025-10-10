import mongoose from "mongoose";
import {
	FamilyTreeMemberDoc,
	ILocation,
	MemberFavThings,
	RelationToMemberEnum,
} from "@conch/shared";

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
		isRelated: {
			type: Boolean,
			required: [true, "Must state if member is related"],
		},
		favThings: {
			type: memberFavoriteThingsSchema,
		},
		claimedId: { type: mongoose.Schema.ObjectId, ref: "User" },
		keyPhoto: {
			type: mongoose.Schema.ObjectId,
			ref: "Media",
		},
		keyPhotoCaption: {
			type: String,
		},
		bestFriend: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "FamilyTreeMember",
		},
		spouses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "FamilyTreeMember",
			},
		],
		dated: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "FamilyTreeMember",
			},
		],
		children: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "FamilyTreeMember",
			},
		],
		parents: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "FamilyTreeMember",
			},
		],
		deletedAt: {
			type: Date,
			select: false,
		},
		gender: {
			type: String,
			enum: ["Male", "Female"],
		},
		summary: { type: String },
		occupations: [{ type: String }],
		formerResidences: [{ type: locationSchema }],
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

//keepind bidirectional data in sync
familyTreeMemberSchema.pre("save", async function (next) {
	const member = this as FamilyTreeMemberDoc;

	if (member.isModified("parents")) {
		await Promise.all(
			(member.parents || []).map(async (parentId) => {
				await FamilyTreeMember.updateOne(
					{ _id: parentId },
					{ $addToSet: { children: member._id } },
				);
			}),
		);
	}

	if (member.isModified("children")) {
		await Promise.all(
			(member.children || []).map(async (childId) => {
				await FamilyTreeMember.updateOne(
					{ _id: childId },
					{ $addToSet: { parents: member._id } },
				);
			}),
		);
	}

	if (member.isModified("dated")) {
		await Promise.all(
			(member.dated || []).map(async (partnerId) => {
				await FamilyTreeMember.updateOne(
					{ _id: partnerId },
					{ $addToSet: { dated: member._id } },
				);
			}),
		);
	}

	if (member.isModified("spouses")) {
		await Promise.all(
			(member.spouses || []).map(async (spouseId) => {
				await FamilyTreeMember.updateOne(
					{ _id: spouseId },
					{ $addToSet: { spouses: member._id } },
				);
			}),
		);
	}

	next();
});

familyTreeMemberSchema.pre(/^find/, function (next) {
	const query = this as mongoose.Query<any, any>;
	const filter = query.getQuery();

	//preventing recursive population caused by bidirectional children/parent population
	if (filter._id && Array.isArray(filter._id.$in)) {
		return next();
	}

	query
		.populate({ path: "keyPhoto", select: "type fileKey" })
		.populate({ path: "bestFriend", select: "name" })
		.populate({ path: "spouses", select: "name" })
		.populate({ path: "dated", select: "name" })
		.populate({ path: "children", select: "name" })
		.populate({ path: "parents", select: "name" });

	next();
});

export const FamilyTreeMember = mongoose.model(
	"FamilyTreeMember",
	familyTreeMemberSchema,
);
