import { BaseCommentProps } from "../BaseComment";

interface IReply {
	comment: BaseCommentProps;
	replyingTo: string;
}

interface ICommentWithReplies {
	comment: BaseCommentProps;
	replies?: IReply[];
}

export interface CommentThreadProps {
	comment: ICommentWithReplies;
}
