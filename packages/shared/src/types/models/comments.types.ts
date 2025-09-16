import mongoose, { Document } from "mongoose";
import {
	HydrateWithMetadata,
	PopulateAuthor,
	PopulateKeyPhoto,
} from "types/utils";

export interface IComment {
	content: string;
	author: mongoose.Types.ObjectId;
	parentComment?: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt?: Date;
	replies?: IComment[];
}

export type CommentDoc = IComment & Document;

export interface UnhydratedCommentDTO {
	content: string;
	author: string;
	parentComment?: string;
	createdAt: Date;
	deletedAt?: Date;
	replies?: UnhydratedCommentDTO[];
}

export type HydratedCommentDTO = HydrateWithMetadata<UnhydratedCommentDTO>;

export type CommentDTOAuthorPopulated = PopulateKeyPhoto<
	PopulateAuthor<HydratedCommentDTO>
>;
export type CommentDTOAuthorAndReplyPopulated = Omit<
	PopulateAuthor<HydratedCommentDTO>,
	"replies"
> & { replies: PopulateAuthor<HydratedCommentDTO>[] };
