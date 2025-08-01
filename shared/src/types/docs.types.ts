import {
	UserDoc,
	MediaDoc,
	LikeDoc,
	FamilyTreeMemberDoc,
	StoryDoc,
	DocumentDoc,
} from "../../../server/src/models";

export type AnyModelDoc =
	| UserDoc
	| MediaDoc
	| LikeDoc
	| FamilyTreeMemberDoc
	| StoryDoc
	| DocumentDoc;
