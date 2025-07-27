import mongoose, { Document } from "mongoose";
import validator from "validator";
import { AppError } from "../utils";
import { hashPassword } from "../utils/password";
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface IUser {
	name: string;
	email: string;
	password: string;
	passwordResetToken?: string;
	passwordResetExpiresAt?: Date;
	familyTreeMember: mongoose.Types.ObjectId;
	createdAt: Date;
	_passwordConfirm?: string;

	isPasswordCorrect: (password: string) => Promise<boolean>;
	createResetPasswordToken: () => string;
}

export type UserDoc = IUser & Document;

const userSchema = new mongoose.Schema<UserDoc>(
	{
		name: {
			type: String,
			required: [true, "A user must have a name"],
			unique: true,
			trim: true,
			maxlength: [30, "A name musn't exceed 30 characters."],
			minlength: [7, "A name must exceed 7 characters."],
		},
		email: {
			type: String,
			required: [true, "A user must have an email"],
			unique: true,
			validate: [validator.isEmail, "Please provide a valid email"],
		},
		password: {
			type: String,
			required: [true, "A user must have a password"],
			minlength: 8,
			select: false,
		},
		familyTreeMember: {
			type: mongoose.Schema.ObjectId,
			ref: "FamilyTreeMember",
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		passwordResetToken: String,
		passwordResetExpiresAt: Date,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

userSchema.virtual("passwordConfirm").set(function (value: string) {
	this._passwordConfirm = value;
});

userSchema.pre("save", function (next) {
	if (this.password !== this._passwordConfirm) {
		return next(new AppError(400, "Passwords are not the same!"));
	}
	next();
});

//password hashing only if password has been modified
userSchema.pre("save", async function (next) {
	try {
		if (!this.isModified("password")) return next();

		this.password = await hashPassword(this.password);
		if (!this.password) {
			throw new AppError(400, "Couldn't safely and securely store password");
		}
		next();
	} catch (err) {
		if (err instanceof AppError) {
			return next(err);
		}

		return next(
			new AppError(
				500,
				err instanceof Error ? err.message : "Something went very wrong",
			),
		);
	}
});

userSchema.methods.isPasswordCorrect = async function (
	candidatePassword: string,
) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (err: unknown) {
		throw new AppError(
			500,
			err instanceof Error
				? err.message
				: "Couldn't verify entered password. Please try again.",
		);
	}
};

userSchema.methods.createResetPasswordToken = function () {
	const BYTE_COUNT = 16; // 1 byte per 2 hex chars; 16 bytes = 32-char desired token
	const PASSWORD_EXPIRE_TIME = 15 * 60 * 1000; // 15 min

	const token = crypto.randomBytes(BYTE_COUNT).toString("hex");
	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(token)
		.digest("hex");
	//15 min expiration
	this.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_EXPIRE_TIME);

	return token;
};

export const User = mongoose.model("User", userSchema);
