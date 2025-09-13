import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata } from "types/utils";

export interface ILike {
	fileKey: string;
	target: mongoose.Types.ObjectId;
	targetType: "Media" | "Document";
	author: mongoose.Types.ObjectId;
	createdAt: Date;
}

export type LikeDoc = ILike & Document;

export interface UnhydratedLikeDTO {
	fileKey: string;
	target: string;
	targetType: "Media" | "Document";
	author: string;
	createdAt: Date;
}

export type HydratedLikeDTO = HydrateWithMetadata<UnhydratedLikeDTO>;
