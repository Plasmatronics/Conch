import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata, PopulateKeyPhoto } from "types/utils";

export interface IDocument {
	fileKey: string;
	type: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
}

export type DocumentDoc = IDocument & Document;

export interface UnhydratedDocumentDTO {
	fileKey: string;
	type: string;
	author: string;
	involves: string[];
	createdAt: Date;
	deletedAt?: Date;
}

export type HydratedDocumentDTO = HydrateWithMetadata<UnhydratedDocumentDTO>;
export type DocumentDTOFileKeyPopulated = PopulateKeyPhoto<HydratedDocumentDTO>;
