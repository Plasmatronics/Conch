import mongoose from "mongoose";
import { MemberFavThings } from "./favThings.types";
import { ILocation } from "./location.types";

export interface IComment {
	content: string;
	author: mongoose.Types.ObjectId;
	parentComment?: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt?: Date;
}

export interface IDocument {
	fileKey: string;
	type: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export interface IFamilyTreeMember extends Document {
	name: string;
	nicknames?: string[];
	birthLocation?: ILocation;
	dateOfBirth: Date;
	dateOfDeath?: Date;
	deathLocation?: ILocation;
	createdAt: Date;
	deletedAt?: Date;
	relationToRootMember: string;
	favThings?: MemberFavThings;
	claimedId?: mongoose.Types.ObjectId;
	keyPhoto?: mongoose.Types.ObjectId;
}

export interface ILike {
	fileKey: string;
	target: mongoose.Types.ObjectId;
	targetType: "Media" | "Document";
	author: mongoose.Types.ObjectId;
	createdAt: Date;
}

export interface IStory {
	title: string;
	content: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	media?: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
	storyDate?: Date;
}

export interface IUser {
	name: string;
	email: string;
	password: string;
	passwordResetToken?: string;
	passwordResetExpiresAt?: Date;
	familyTreeMember: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt?: Date;
	_passwordConfirm?: string;

	isPasswordCorrect: (password: string) => Promise<boolean>;
	createResetPasswordToken: () => string;
}

export interface IMedia {
	fileKey: string;
	description?: string;
	type: "image" | "video";
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export type AnyModelInterface = IComment &
	IDocument &
	IFamilyTreeMember &
	IUser &
	ILike &
	IStory &
	IMedia;
