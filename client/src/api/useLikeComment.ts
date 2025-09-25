import { useMutation } from "@tanstack/react-query";

export const useLikeComment = ({
	userId,
	storyId,
	...reactQueryProps
}: useLikeCommentProps) => {
	const commentMutation = useMutation<
		PopulatedCommentDTO,
		Error,
		CommentDataProps
	>({
		mutationKey: ["comment", userId, storyId],
		mutationFn: (data) =>
			postComment({
				userId,
				storyId,
				comment: data.comment,
				replyingTo: data.replyingTo,
			}),
		...reactQueryProps,
	});

	return commentMutation;
};
