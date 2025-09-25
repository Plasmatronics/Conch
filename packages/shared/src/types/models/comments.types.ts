import mongoose, { Document } from "mongoose";
import {
	HydrateWithMetadata,
	PopulateAuthor,
	PopulateKeyPhoto,
	PopulateReplyingTo,
} from "types/utils";

export interface IComment {
	content: string;
	author: mongoose.Types.ObjectId;
	target: mongoose.Types.ObjectId;
	parentComment?: mongoose.Types.ObjectId;
	replyingTo?: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt?: Date;
	replies?: IComment[];
	likes: number;
}

export type CommentDoc = IComment & Document;

export interface UnhydratedCommentDTO {
	content: string;
	author: string;
	target: string;
	replyingTo?: string;
	parentComment?: string;
	createdAt: Date;
	deletedAt?: Date;
	replies?: UnhydratedCommentDTO[];
	likes: number;
}

export type HydratedCommentDTO = Omit<
	HydrateWithMetadata<UnhydratedCommentDTO>,
	"replies"
> & { replies: HydratedCommentDTO[] };

type CommentDTOAuthorPopulated = PopulateKeyPhoto<
	PopulateAuthor<HydratedCommentDTO>
>;

type CommentDTOReplyingToPopulated = PopulateReplyingTo<HydratedCommentDTO>;

export type PopulatedCommentDTO = Omit<
	CommentDTOAuthorPopulated & CommentDTOReplyingToPopulated,
	"replies"
> & {
	replies: PopulatedCommentDTO[];
};
