import mongoose, { Document } from "mongoose";
import {
	HydrateWithMetadata,
	PopulateAuthor,
	PopulateKeyPhoto,
} from "types/utils";
import { HydratedMediaDTO } from "./media.types";

export interface IStory {
	title: string;
	content: string;
	author: mongoose.Types.ObjectId;
	involves: mongoose.Types.ObjectId[];
	media?: mongoose.Types.ObjectId[];
	createdAt: Date;
	deletedAt?: Date;
	storyDate?: Date;
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
}

export type HydratedStoryDTO = HydrateWithMetadata<UnhydratedStoryDTO>;
export type StoryDTOAuthorPopulated = Omit<
	PopulateAuthor<HydratedStoryDTO>,
	"media"
> & {
	media: {
		type: HydratedMediaDTO["type"];
		downloadUrl: string;
	}[];
};
export type StoryDTOMediaPopulated = PopulateKeyPhoto<
	PopulateAuthor<HydratedStoryDTO>
>;
