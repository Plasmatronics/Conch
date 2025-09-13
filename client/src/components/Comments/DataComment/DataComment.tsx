import { useState } from "react";
import { BaseComment } from "../BaseComment";

export interface DataCommentProps {
	commentId: CommentId;
	personId: PersonId;
}

export const DataComment = ({ commentId, personId }: DataCommentProps) => {
	const [isLiked, setIsLiked] = useState(false);
	return <BaseComment isLiked={isLiked} setIsLiked={setIsLiked} />;
};
