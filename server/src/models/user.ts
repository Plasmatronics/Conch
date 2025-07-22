import mongoose, { Document } from "mongoose";
import validator from "validator";
import { AppError } from "../utils";
import { hashPassword } from "../utils/password";

export interface IUser {
	name: string;
	email: string;
	password: string;
	storiesContributed: mongoose.Types.ObjectId[];
	likes: mongoose.Types.ObjectId[];
	mediaProvided: mongoose.Types.ObjectId[];
	documentsUploaded: mongoose.Types.ObjectId[];
	familyTreeMember: mongoose.Types.ObjectId[];
	createdAt: Date;
	_passwordConfirm?: string;
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
		storiesContributed: {
			type: [mongoose.Schema.ObjectId],
			ref: "Story",
		},
		likes: {
			type: [mongoose.Schema.ObjectId],
			ref: "Like",
		},
		mediaProvided: {
			type: [mongoose.Schema.ObjectId],
			ref: "Media",
		},
		documentsUploaded: {
			type: [mongoose.Schema.ObjectId],
			ref: "Document",
		},
		familyTreeMember: {
			type: [mongoose.Schema.ObjectId],
			ref: "FamilyTreeMember",
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

		console.error("💥", err);
		return next(
			new AppError(
				500,
				err instanceof Error ? err.message : "Something went very wrong",
			),
		);
	}
});

export const User = mongoose.model("User", userSchema);
