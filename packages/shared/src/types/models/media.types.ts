import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata, PopulateKeyPhoto } from "types/utils";

type DownloadUrl = string;

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

export interface MediaTypeAndKey {
	type: UnhydratedMediaDTO["type"];
	fileKey: UnhydratedMediaDTO["fileKey"];
}

export interface MediaTypeAndDownloadUrl {
	type: UnhydratedMediaDTO["type"];
	downloadUrl: DownloadUrl;
}

export type HydratedMediaDTO = HydrateWithMetadata<UnhydratedMediaDTO>;
export type MediaDTOFileKeyPopulated = PopulateKeyPhoto<HydratedMediaDTO>;
