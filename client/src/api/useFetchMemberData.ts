import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import {
	PopulatedFamilyTreeMemberDTO,
	PopulatedFamilyTreeMemberDTOWithStory,
} from "@conch/shared";
import { useFetchMediaData } from "./useFetchMediaData";

type ReactQueryOptions = Omit<
	UseQueryOptions<
		PopulatedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberDTOWithStory
	>,
	"queryFn" | "queryKey"
>;

interface IFetchMemberData {
	personId: PopulatedFamilyTreeMemberDTO["id"];
	includeParamsValues?: string[];
}

type useFetchMemberDataProps = IFetchMemberData & ReactQueryOptions;

const fetchMemberData = async ({
	personId,
	includeParamsValues,
}: IFetchMemberData): Promise<
	PopulatedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberDTOWithStory
> => {
	try {
		const params = new URLSearchParams();

		if (includeParamsValues?.length) {
			params.set("include", includeParamsValues.join(","));
		}
		const url = `http://127.0.0.1:3000/api/v1/familyTreeMembers/${personId}${
			params ? `?${params.toString()}` : ""
		}`;
		const { data } = await axios.get<{
			data:
				| PopulatedFamilyTreeMemberDTO
				| PopulatedFamilyTreeMemberDTOWithStory;
		}>(url);

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useFetchMemberData = ({
	personId,
	includeParamsValues,
	...reactQueryProps
}: useFetchMemberDataProps) => {
	const memberQuery = useQuery<
		PopulatedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberDTOWithStory
	>({
		queryKey: ["member", personId, includeParamsValues],
		queryFn: () => fetchMemberData({ personId, includeParamsValues }),
		enabled: !!personId,
		...reactQueryProps,
	});

	const keyPhotoData = memberQuery.data?.keyPhoto;
	const avatarFile = keyPhotoData
		? [
				{
					fileKey: keyPhotoData.fileKey,
					type: keyPhotoData.type,
				},
			]
		: [];

	const avatarQuery = useFetchMediaData({
		files: avatarFile,
		enabled: !!keyPhotoData,
	});

	return { memberQuery, avatarQuery };
};
