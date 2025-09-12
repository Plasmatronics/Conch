import mongoose, { Document } from "mongoose";
import { HydrateWithMongoose } from "types/utils";

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

export type UserDoc = IUser & Document;

export interface UnhydratedUserDTO {
	name: string;
	email: string;
	password: string;
	passwordResetToken?: string;
	passwordResetExpiresAt?: Date;
	familyTreeMember: string;
	createdAt: Date;
	deletedAt?: Date;
	_passwordConfirm?: string;

	isPasswordCorrect: (password: string) => Promise<boolean>;
	createResetPasswordToken: () => string;
}

export type HydratedUserDTO = HydrateWithMongoose<UnhydratedUserDTO>;
