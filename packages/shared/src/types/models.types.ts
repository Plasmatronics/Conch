import {
	IComment,
	IDocument,
	IFamilyTreeMember,
	IUser,
	ILike,
	IStory,
	IMedia,
} from "./models";

export type AnyModelInterface =
	| IComment
	| IDocument
	| IFamilyTreeMember
	| IUser
	| ILike
	| IStory
	| IMedia;
