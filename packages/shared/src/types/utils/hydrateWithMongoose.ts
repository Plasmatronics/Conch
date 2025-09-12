import mongoose from "mongoose";

export type HydrateWithMongoose<T> = T & {
	_id?: mongoose.Types.ObjectId;
	id?: mongoose.Types.ObjectId;
	__v?: number;
};
