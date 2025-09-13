import mongoose, { Document } from "mongoose";
import { HydrateWithMetadata } from "types/utils";

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
