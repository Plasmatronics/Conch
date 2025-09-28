import {
	PopulatedCommentDTO,
	HydratedStoryDTO,
	HydratedUserDTO,
	PopulatedStoryDTO,
	HydratedFamilyTreeMemberDTO,
} from "@conch/shared";
import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface CommentDataProps {
	comment: string;
	replyingTo: HydratedUserDTO["id"];
	author: HydratedUserDTO["name"];
	userAvatar: string;
	relationToRootMember: HydratedFamilyTreeMemberDTO["relationToRootMember"];
}

type ReactQueryOptions = Omit<
	UseMutationOptions<PopulatedCommentDTO, Error, CommentDataProps>,
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
}: IPostComment): Promise<PopulatedCommentDTO> => {
	try {
		let parentComment;
		let replyingToId;
		if (replyingTo) {
			const { data: storyData } = await axios.get(
				`http://127.0.0.1:3000/api/v1/stories/${storyId}/comments`,
			);

			storyData.comments.forEach((thread: PopulatedCommentDTO) => {
				if (thread.id === replyingTo) {
					parentComment = thread.id;
					replyingToId = thread.author.id;
				}

				thread?.replies?.forEach((reply) => {
					if (reply.parentComment === replyingTo) {
						parentComment = reply.parentComment;
						replyingToId = reply.author.id;
					}
				});
			});
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
	const queryClient = useQueryClient();

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
		onMutate: async (data) => {
			await queryClient.cancelQueries({
				queryKey: ["story", storyId],
				exact: true,
			});

			const curStoryData = queryClient.getQueryData<PopulatedStoryDTO>([
				"story",
				storyId,
			]);

			if (!curStoryData) return { curStoryData };

			const tempComment: PopulatedCommentDTO = {
				id: uuidv4(),
				author: {
					id: userId,
					name: data.author,
					relationToRootMember: data.relationToRootMember,
					keyPhoto: { fileKey: data.userAvatar, type: "image", id: uuidv4() },
				} as PopulatedCommentDTO["author"],
				content: data.comment,
				createdAt: new Date(),
				likes: 0,
				isLikedByUser: false,
				replies: [],
				target: storyId,
			};

			let nextComments;
			if (data.replyingTo) {
				nextComments =
					curStoryData.comments?.map((comment) => {
						const isParent = comment.id === data.replyingTo;
						const isReply = comment.replies?.some(
							(reply) => reply.id === data.replyingTo,
						);

						if (isParent || isReply) {
							return {
								...comment,
								replies: [
									...(comment.replies || []),
									{
										...tempComment,
										replyingTo: data.replyingTo,
										parentComment: comment.id,
									},
								],
							} as PopulatedCommentDTO;
						}
						return comment;
					}) || [];
			} else {
				nextComments = [...(curStoryData.comments || []), tempComment];
			}

			const nextStoryData: PopulatedStoryDTO = {
				...curStoryData,
				comments: nextComments,
			};

			queryClient.setQueryData(["story", storyId], nextStoryData);

			return { curStoryData };
		},
		onError: (_, __, mutationRes: any) => {
			if (mutationRes?.curStoryData) {
				queryClient.setQueryData(["story", storyId], mutationRes?.curStoryData);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["story", storyId],
				exact: true,
			});
		},
	});

	return commentMutation;
};
