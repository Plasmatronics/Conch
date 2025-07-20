import mongoose from "mongoose";

const userSchema = new mongoose.Schema({ name: String, size: String });
const User = mongoose.model("Tank", userSchema);

export default User;
