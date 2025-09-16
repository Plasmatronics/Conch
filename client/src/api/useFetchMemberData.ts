import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
	FamilyTreeMemberDTOKeyPhotoPopulated,
	FamilyTreeMemberDTOKeyPhotoAndStoryPopulated,
} from "@conch/shared";

type ReactQueryOptions = Omit<
	UseQueryOptions<
		| FamilyTreeMemberDTOKeyPhotoPopulated
		| FamilyTreeMemberDTOKeyPhotoAndStoryPopulated,
		Error,
		| FamilyTreeMemberDTOKeyPhotoPopulated
		| FamilyTreeMemberDTOKeyPhotoAndStoryPopulated
	>,
	"queryFn" | "queryKey"
>;

interface IFetchMemberData {
	personId: FamilyTreeMemberDTOKeyPhotoPopulated["id"];
	includeParamsValues?: string[];
}

type useFetchMemberDataProps = IFetchMemberData & ReactQueryOptions;

const fetchMemberData = async ({
	personId,
	includeParamsValues,
}: IFetchMemberData): Promise<
	| FamilyTreeMemberDTOKeyPhotoPopulated
	| FamilyTreeMemberDTOKeyPhotoAndStoryPopulated
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
				| FamilyTreeMemberDTOKeyPhotoPopulated
				| FamilyTreeMemberDTOKeyPhotoAndStoryPopulated;
		}>(url);

		return data.data;
	} catch (err: unknown) {
		throw new Error(
			(err as AxiosError).message || "Failed to fetch member data",
		);
	}
};

export const useFetchMemberData = ({
	personId,
	includeParamsValues,
	...reactQueryProps
}: useFetchMemberDataProps) => {
	const memberQuery = useQuery<
		| FamilyTreeMemberDTOKeyPhotoPopulated
		| FamilyTreeMemberDTOKeyPhotoAndStoryPopulated,
		Error
	>({
		queryKey: ["member", personId, includeParamsValues],
		queryFn: () => fetchMemberData({ personId, includeParamsValues }),
		enabled: !!personId,
		...reactQueryProps,
	});

	return { memberQuery };
};
