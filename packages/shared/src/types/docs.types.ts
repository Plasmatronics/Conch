import {
	CommentDoc,
	UserDoc,
	MediaDoc,
	LikeDoc,
	FamilyTreeMemberDoc,
	StoryDoc,
	DocumentDoc,
} from "./models";

export type AnyModelDoc =
	| CommentDoc
	| UserDoc
	| MediaDoc
	| LikeDoc
	| FamilyTreeMemberDoc
	| StoryDoc
	| DocumentDoc;
