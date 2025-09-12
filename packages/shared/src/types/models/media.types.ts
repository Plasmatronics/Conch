import mongoose, { Document } from "mongoose";
import { HydrateWithMongoose } from "types/utils";

export interface IMedia {
	fileKey: string;
	description?: string;
	type: "image" | "video";
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export type MediaDoc = IMedia & Document;

export interface UnhydratedMediaDTO {
	fileKey: string;
	description?: string;
	type: "image" | "video";
	author: string;
	involves: string[];
	createdAt: Date;
	deletedAt?: Date;
}

export type HydratedMediaDTO = HydrateWithMongoose<UnhydratedMediaDTO>;
