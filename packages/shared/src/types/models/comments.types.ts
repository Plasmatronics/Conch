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
> & { replies: HydrateWithMetadata<UnhydratedCommentDTO["replies"]> };

export type CommentDTOAuthorPopulated = PopulateKeyPhoto<
	PopulateAuthor<HydratedCommentDTO>
>;

export type CommentDTOReplyingToPopulated =
	PopulateReplyingTo<HydratedCommentDTO>;

export type CommentDTOAuthorAndReplyPopulated = Omit<
	PopulateAuthor<HydratedCommentDTO>,
	"replies"
> & {
	replies: PopulateReplyingTo<PopulateAuthor<HydratedCommentDTO>>[];
};

export type PopulatedCommentDTO = CommentDTOAuthorAndReplyPopulated &
	CommentDTOReplyingToPopulated &
	CommentDTOAuthorPopulated;
