import {
	HydratedFamilyTreeMemberDTO,
	HydratedUserDTO,
	MediaTypeAndKey,
	PopulatedFamilyTreeMemberDTOWithStory,
} from "@conch/shared";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useFetchMediaData } from "../../api";
import axios from "axios";

type IFetchPersonData = {
	personId: HydratedFamilyTreeMemberDTO["id"];
};

type ReactQueryOptions = Omit<
	UseQueryOptions<PopulatedFamilyTreeMemberDTOWithStory>,
	"queryFn" | "queryKey"
>;

type usePersonProps = IFetchPersonData & ReactQueryOptions;

const fetchPersonData = async ({
	personId,
}: IFetchPersonData): Promise<PopulatedFamilyTreeMemberDTOWithStory> => {
	try {
		const { data } = await axios.get<{
			data: PopulatedFamilyTreeMemberDTOWithStory;
		}>(`http://127.0.0.1:3000/api/v1/familyTreeMembers/${personId}/stories`);

		return data.data;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const usePerson = ({ personId, ...reactQueryProps }: usePersonProps) => {
	const personQuery = useQuery<PopulatedFamilyTreeMemberDTOWithStory>({
		queryKey: ["person", personId],
		queryFn: () => fetchPersonData({ personId }),
		enabled: !!personId,
		...reactQueryProps,
	});

	const fileKeys: MediaTypeAndKey[] = [];
	const commentAuthorMap = new Map<
		string,
		{
			authorId: HydratedUserDTO["id"];
			name: HydratedUserDTO["name"];
		}
	>();

	if (personQuery.data) {
		//collecting member key photo data
		if (personQuery.data.keyPhoto) {
			fileKeys.push({
				fileKey: personQuery.data.keyPhoto.fileKey,
				type: personQuery.data.keyPhoto.type,
			});
		}

		for (const story of personQuery.data.stories) {
			const storyComments = story.comments || [];
			//collecting story poster key photo data
			if (story.author.familyTreeMember.keyPhoto) {
				fileKeys.push({
					fileKey: story.author.familyTreeMember.keyPhoto.fileKey,
					type: story.author.familyTreeMember.keyPhoto.type,
				});
			}

			for (const media of story.media) {
				//collecting story media data
				fileKeys.push({
					fileKey: media.fileKey,
					type: media.type,
				});
			}

			for (const commentThread of storyComments) {
				commentAuthorMap.set(commentThread.id, {
					authorId: commentThread.author.id,
					name: commentThread.author.familyTreeMember.name,
				});

				//collecting story commentThread parent key photos data
				if (commentThread.author.familyTreeMember.keyPhoto) {
					fileKeys.push({
						fileKey: commentThread.author.familyTreeMember.keyPhoto.fileKey,
						type: commentThread.author.familyTreeMember.keyPhoto.type,
					});
				}
				const replies = commentThread.replies || [];
				for (const reply of replies) {
					commentAuthorMap.set(reply.id, {
						authorId: reply.author.id,
						name: reply.author.familyTreeMember.name,
					});

					//collecting story commentThread reply key photos data
					if (reply.author) {
						fileKeys.push({
							fileKey: reply.author.familyTreeMember.keyPhoto.fileKey,
							type: reply.author.familyTreeMember.keyPhoto.type,
						});
					}
				}
			}
		}
	}

	const avatarAndMediaMapQuery = useFetchMediaData({
		files: fileKeys,
		enabled: !!personQuery.data && fileKeys.length > 0,
	});

	return { avatarAndMediaMapQuery, commentAuthorMap, personQuery };
};
