import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { HydratedMediaDTO } from "@conch/shared";

type HydratedMediaDTOWithDownloadFile = HydratedMediaDTO & {
	downloadUrl: string;
};

type ReactQueryOptions = Omit<
	UseQueryOptions<
		HydratedMediaDTOWithDownloadFile[],
		Error,
		HydratedMediaDTOWithDownloadFile[]
	>,
	"queryFn" | "queryKey"
>;

interface IFetchMediaData {
	ids: HydratedMediaDTO["id"][];
}

type useFetchMediaDataProps = IFetchMediaData & ReactQueryOptions;

const fetchSingleMediaData = async (
	id: HydratedMediaDTO["id"],
): Promise<HydratedMediaDTOWithDownloadFile> => {
	try {
		const { data: fileProperties } = await axios.get<{
			data: HydratedMediaDTO;
		}>(`http://127.0.0.1:3000/api/v1/media/${id}`);

		const { data: mediaData } = await axios.post<{
			downloadUrl: string;
		}>(
			"http://127.0.0.1:3000/api/v1/files/download-url",
			{
				fileKey: fileProperties.data.fileKey,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		return { ...fileProperties.data, downloadUrl: mediaData.downloadUrl };
	} catch (err: unknown) {
		throw new Error(
			(err as AxiosError).message || "Failed to fetch media data",
		);
	}
};

const fetchMediaData = async ({
	ids,
}: IFetchMediaData): Promise<HydratedMediaDTOWithDownloadFile[]> => {
	return await Promise.all(
		ids.map((key: HydratedMediaDTO["id"]) => fetchSingleMediaData(key)),
	);
};

export const useFetchMediaData = ({
	ids,
	...reactQueryProps
}: useFetchMediaDataProps) => {
	return useQuery<HydratedMediaDTOWithDownloadFile[], Error>({
		queryKey: [ids],
		queryFn: () => fetchMediaData({ ids }),
		...reactQueryProps,
	});
};
