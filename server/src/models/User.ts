import mongoose, { Document } from "mongoose";
import validator from "validator";

interface UserInterface extends Document {
	name: string;
	email: string;
	password: string;
	createdAt: Date;
	_passwordConfirm?: string;
}

const userSchema = new mongoose.Schema<UserInterface>(
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
		return next(new Error("Passwords are not the same!"));
	}
	next();
});

const User = mongoose.model("User", userSchema);
export default User;
