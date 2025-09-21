import { FacePileProps } from "../../Elements";
import { BaseCommentProps } from "../BaseComment";

export interface IReply {
	comment: BaseCommentProps;
	replyingTo: string;
}

export interface ICommentWithReplies {
	comment: BaseCommentProps;
	replies?: IReply[];
}

export interface CommentThreadProps {
	comment: ICommentWithReplies;
	facePileAvatars?: FacePileProps["avatars"];
}
