import {
	CommentDTOAuthorAndReplyPopulated,
	HydratedCommentDTO,
	HydratedStoryDTO,
	HydratedUserDTO,
} from "@conch/shared";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";

interface CommentDataProps {
	comment: string;
	replyingTo: HydratedUserDTO["id"];
}

type ReactQueryOptions = Omit<
	UseMutationOptions<HydratedCommentDTO, Error, CommentDataProps>,
	"mutationFn" | "mutationKey"
>;

interface IPostComment {
	storyId: HydratedStoryDTO["id"];
	userId: HydratedUserDTO["id"];
	comment: string;
	replyingTo?: HydratedUserDTO["id"];
}

type useDataPostCommentProps = Omit<IPostComment, "comment"> &
	ReactQueryOptions;

const postComment = async ({
	storyId,
	userId,
	comment,
	replyingTo,
}: IPostComment): Promise<HydratedCommentDTO> => {
	try {
		let parentComment;
		let replyingToId;
		if (replyingTo) {
			const { data: storyData } = await axios.get(
				`http://127.0.0.1:3000/api/v1/stories/${storyId}/comments`,
			);

			storyData.comments.forEach(
				(thread: CommentDTOAuthorAndReplyPopulated) => {
					if (thread.id === replyingTo) {
						parentComment = thread.id;
						replyingToId = thread.author.id;
					}

					thread?.replies.forEach((reply) => {
						if (reply.parentComment === replyingTo) {
							parentComment = reply.parentComment;
							replyingToId = reply.author.id;
						}
					});
				},
			);
		}

		const payload = {
			target: storyId,
			author: userId,
			content: comment,
			...(parentComment ? { parentComment } : {}),
			...(replyingToId ? { replyingTo: replyingToId } : {}),
		};

		const { data } = await axios.post(
			"http://127.0.0.1:3000/api/v1/comments",
			payload,
		);

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useDataPostComment = ({
	userId,
	storyId,
	...reactQueryProps
}: useDataPostCommentProps) => {
	const commentMutation = useMutation<
		HydratedCommentDTO,
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
