import { useState } from "react";
import { BaseComment } from "../BaseComment";
import { CommentId, PersonId } from "types";

export interface DataCommentProps {
	commentId: CommentId;
	personId: PersonId;
}

export const DataComment = ({ commentId, personId }: DataCommentProps) => {
	const [isLiked, setIsLiked] = useState(false);
	return <BaseComment isLiked={isLiked} setIsLiked={setIsLiked} />;
};
