import {
	HydratedCommentDTO,
	HydratedStoryDTO,
	HydratedUserDTO,
	MediaTypeAndKey,
	PopulatedStoryDTO,
} from "@conch/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useFetchMediaData } from "../../../../api";
import axios from "axios";

type IFetchDataPost = {
	storyId: HydratedStoryDTO["id"];
};

type ReactQueryOptions = Omit<
	UseQueryOptions<PopulatedStoryDTO>,
	"queryFn" | "queryKey"
>;

type useDataPostProps = IFetchDataPost & ReactQueryOptions;

const fetchDataPost = async ({
	storyId,
}: IFetchDataPost): Promise<PopulatedStoryDTO> => {
	try {
		const url = `http://127.0.0.1:3000/api/v1/stories/${storyId}/comments`;
		const { data } = await axios.get<{
			data: PopulatedStoryDTO;
		}>(url);

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useDataPost = ({
	storyId,
	...restQueryProps
}: useDataPostProps) => {
	const storyQuery = useQuery<PopulatedStoryDTO>({
		queryKey: ["story", storyId],
		queryFn: () => fetchDataPost({ storyId }),
		...restQueryProps,
	});

	const imgFiles: MediaTypeAndKey[] = [
		{
			fileKey:
				storyQuery?.data?.author?.familyTreeMember.keyPhoto?.fileKey ?? "",
			type:
				storyQuery?.data?.author?.familyTreeMember.keyPhoto?.type ?? "image",
		},
	];

	const commentAuthorMap = new Map<
		HydratedCommentDTO["id"],
		{ authorId: HydratedUserDTO["id"]; name: HydratedUserDTO["name"] }
	>();

	storyQuery?.data?.comments?.map((comment) => {
		imgFiles.push({
			fileKey: comment.author.familyTreeMember.keyPhoto.fileKey,
			type: comment.author.familyTreeMember.keyPhoto.type,
		});

		commentAuthorMap.set(comment.id, {
			authorId: comment.author.id,
			name: comment.author.name,
		});

		comment.replies?.map((reply) => {
			commentAuthorMap.set(reply.id, {
				authorId: reply.author.id,
				name: reply.author.name,
			});
		});
	});

	const avatarQuery = useFetchMediaData({
		files: imgFiles ? imgFiles : [],
		enabled: storyQuery.isSuccess && !!imgFiles,
	});

	return { avatarQuery, storyQuery, commentAuthorMap };
};
