import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useFetchMediaData } from "./useFetchMediaData";
import {
	HydratedFamilyTreeMemberDTO,
	PopulatedFamilyTreeMemberAPIResponse,
} from "@conch/shared";

type ReactQueryOptions = Omit<
	UseQueryOptions<
		HydratedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberAPIResponse,
		Error,
		HydratedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberAPIResponse
	>,
	"queryFn" | "queryKey"
>;

interface IFetchMemberData {
	personId: HydratedFamilyTreeMemberDTO["id"];
	includeParamsValues?: string[];
}

type useFetchMemberDataProps = IFetchMemberData & ReactQueryOptions;

const fetchMemberData = async ({
	personId,
	includeParamsValues,
}: IFetchMemberData): Promise<
	HydratedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberAPIResponse
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
			data: HydratedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberAPIResponse;
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
		HydratedFamilyTreeMemberDTO | PopulatedFamilyTreeMemberAPIResponse,
		Error
	>({
		queryKey: ["member", personId, includeParamsValues],
		queryFn: () => fetchMemberData({ personId, includeParamsValues }),
		enabled: !!personId,
		...reactQueryProps,
	});

	const keyPhotoId = memberQuery.data?.keyPhoto;

	const keyPhotoQuery = useFetchMediaData({
		ids: keyPhotoId ? [keyPhotoId] : [],
		enabled: !!memberQuery.data && !!keyPhotoId,
	});

	return { memberQuery, keyPhotoQuery };
};
