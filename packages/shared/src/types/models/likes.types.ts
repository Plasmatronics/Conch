import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata } from "types/utils";

export interface ILike {
	target: mongoose.Types.ObjectId;
	targetType: "Comment" | "Story";
	author: mongoose.Types.ObjectId;
	createdAt: Date;
}

export type LikeDoc = ILike & Document;

export interface UnhydratedLikeDTO {
	target: string;
	targetType: "Comment" | "Story";
	author: string;
	createdAt: Date;
}

export type HydratedLikeDTO = HydrateWithMetadata<UnhydratedLikeDTO>;
