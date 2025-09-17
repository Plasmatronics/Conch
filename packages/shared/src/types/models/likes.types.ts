import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata } from "types/utils";

export interface ILike {
	fileKey: mongoose.Types.ObjectId;
	target: mongoose.Types.ObjectId;
	targetType: "Media" | "Document";
	author: mongoose.Types.ObjectId;
	createdAt: Date;
}

export type LikeDoc = ILike & Document;

export interface UnhydratedLikeDTO {
	fileKey: string;
	target: string;
	targetType: "Comment" | "Document" | "Story";
	author: string;
	createdAt: Date;
}

export type HydratedLikeDTO = HydrateWithMetadata<UnhydratedLikeDTO>;
