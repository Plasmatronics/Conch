import mongoose from "mongoose";
import zod from "zod";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "A user must have a name"],
		unique: true,
		trim: true,
		maxlength: [30, "A name musn't exceed 30 characters."],
		minlength: [7, "A name must exceed 78 characters."],
	},
	email: {
		type: String,
		required: [true, "A user must have an email"],
		unique: true,
		validate: [zod.email(), "Please provide a valid email"],
	},
});
const User = mongoose.model("User", userSchema);

export default User;
