import { Document } from "mongoose";
import {
	IComment,
	IDocument,
	IFamilyTreeMember,
	ILike,
	IMedia,
	IStory,
	IUser,
} from "./models.types";

export type CommentDoc = IComment & Document;
export type DocumentDoc = IDocument & Document;
export type FamilyTreeMemberDoc = IFamilyTreeMember & Document;
export type LikeDoc = ILike & Document;
export type MediaDoc = IMedia & Document;
export type StoryDoc = IStory & Document;
export type UserDoc = IUser & Document;

export type AnyModelDoc =
	| CommentDoc
	| UserDoc
	| MediaDoc
	| LikeDoc
	| FamilyTreeMemberDoc
	| StoryDoc
	| DocumentDoc;
