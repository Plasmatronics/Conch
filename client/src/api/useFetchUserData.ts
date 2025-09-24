import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { useFetchMediaData } from "./useFetchMediaData";
import { UserDTOMemberPopulated } from "@conch/shared";

type ReactQueryOptions = Omit<
	UseQueryOptions<UserDTOMemberPopulated>,
	"queryFn" | "queryKey"
>;

interface IFetchUserData {
	userId: UserDTOMemberPopulated["id"];
	includeParamsValues?: string[];
}

type useFetchMemberDataProps = IFetchUserData & ReactQueryOptions;

const fetchUserData = async ({
	userId,
	includeParamsValues,
}: IFetchUserData): Promise<UserDTOMemberPopulated> => {
	try {
		const params = new URLSearchParams();

		if (includeParamsValues?.length) {
			params.set("include", includeParamsValues.join(","));
		}
		const url = `http://127.0.0.1:3000/api/v1/users/${userId}${
			params ? `?${params.toString()}` : ""
		}`;
		const { data } = await axios.get<{
			data: UserDTOMemberPopulated;
		}>(url);

		return data.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

export const useFetchUserData = ({
	userId,
	includeParamsValues,
	...reactQueryProps
}: useFetchMemberDataProps) => {
	const userQuery = useQuery<UserDTOMemberPopulated>({
		queryKey: ["user", userId, includeParamsValues],
		queryFn: () => fetchUserData({ userId, includeParamsValues }),
		enabled: !!userId,
		...reactQueryProps,
	});

	const keyPhotoData = userQuery.data?.familyTreeMember.keyPhoto;
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

	return { userQuery, avatarQuery };
};
