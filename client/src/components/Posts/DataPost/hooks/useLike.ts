import {
	HydratedCommentDTO,
	HydratedLikeDTO,
	HydratedUserDTO,
	PopulatedCommentDTO,
	PopulatedStoryDTO,
	UnhydratedLikeDTO,
} from "@conch/shared";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";

type LikeDataProps = {
	commentId?: HydratedCommentDTO["id"];
	type: HydratedLikeDTO["targetType"];
};

type ReactQueryOptions = Omit<
	UseMutationOptions<HydratedLikeDTO, Error, LikeDataProps>,
	"mutationFn" | "mutationKey"
>;

interface IMutateLike {
	userId: HydratedUserDTO["id"];
	storyId: PopulatedStoryDTO["id"];
	commentId: PopulatedCommentDTO["id"];
	type: HydratedLikeDTO["targetType"];
}

type useLikeProps = Omit<IMutateLike, "type" | "commentId"> & ReactQueryOptions;

const mutateLike = async ({
	userId,
	commentId,
	type,
	storyId,
}: IMutateLike): Promise<HydratedLikeDTO> => {
	try {
		const payload: Omit<UnhydratedLikeDTO, "createdAt"> = {
			author: userId,
			targetType: type,
			target: type === "Comment" ? commentId : storyId,
		};

		const { data: likeExists } = await axios.get<{
			data: HydratedLikeDTO | null;
		}>(
			`http://127.0.0.1:3000/api/v1/likes/?target=${payload.target}&author=${userId}`,
		);

		let data;
		if (!likeExists.data) {
			const { data: createdData } = await axios.post(
				"http://127.0.0.1:3000/api/v1/likes",
				payload,
			);
			data = createdData;
		} else {
			const { data: deletedData } = await axios.delete(
				`http://127.0.0.1:3000/api/v1/likes/?target=${likeExists.data.id}`,
			);
			data = deletedData;
		}

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useLike = ({
	userId,
	storyId,
	...reactQueryProps
}: useLikeProps) => {
	const likeMutation = useMutation<HydratedLikeDTO, Error, LikeDataProps>({
		mutationKey: ["like", userId],
		mutationFn: (data) =>
			mutateLike({
				userId,
				commentId: data.commentId || "",
				type: data.type,
				storyId,
			}),
		...reactQueryProps,
	});

	return likeMutation;
};
