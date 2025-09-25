import mongoose, { Document } from "mongoose";
import {
	HydrateWithMetadata,
	PopulateAuthor,
	PopulateKeyPhoto,
} from "types/utils";
import { HydratedMediaDTO } from "./media.types";
import { PopulatedCommentDTO } from "./comments.types";

export interface IStory {
	title: string;
	content: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	media?: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
	storyDate?: Date;
	likes?: number;
	comments?: mongoose.Types.ObjectId[];
}

export type StoryDoc = IStory & Document;

export interface UnhydratedStoryDTO {
	title: string;
	content: string;
	author: string;
	involves: string[];
	media?: string[];
	createdAt: Date;
	deletedAt?: Date;
	storyDate?: Date;
	likes?: number;
	comments?: PopulatedCommentDTO[];
}

export type HydratedStoryDTO = HydrateWithMetadata<UnhydratedStoryDTO>;

type StoryDTOAuthorPopulated = PopulateKeyPhoto<
	PopulateAuthor<HydratedStoryDTO>
>;
type StoryDTOMediaPopulated = Omit<HydratedStoryDTO, "media"> & {
	media: {
		type: HydratedMediaDTO["type"];
		fileKey: string;
	}[];
};

export type PopulatedStoryDTO = StoryDTOMediaPopulated &
	StoryDTOAuthorPopulated;
