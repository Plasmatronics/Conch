import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MediaTypeAndDownloadUrl, MediaTypeAndKey } from "@conch/shared";

type ReactQueryOptions = Omit<
	UseQueryOptions<MediaTypeAndDownloadUrl[], Error, MediaTypeAndDownloadUrl[]>,
	"queryFn" | "queryKey"
>;

interface useFetchMediaDataProps extends ReactQueryOptions {
	files: MediaTypeAndKey[];
}

const fetchSingleMediaData = async ({
	fileKey,
	type,
}: MediaTypeAndKey): Promise<MediaTypeAndDownloadUrl> => {
	try {
		const { data } = await axios.post<{
			downloadUrl: string;
		}>(
			"http://127.0.0.1:3000/api/v1/files/download-url",
			{
				fileKey,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		return { downloadUrl: data.downloadUrl, type };
	} catch (err: unknown) {
		throw new Error(
			(err as AxiosError).message || "Failed to fetch media data",
		);
	}
};

const fetchMediaData = async (
	files: MediaTypeAndKey[],
): Promise<MediaTypeAndDownloadUrl[]> => {
	return await Promise.all(
		files.map((file) =>
			fetchSingleMediaData({ fileKey: file.fileKey, type: file.type }),
		),
	);
};

export const useFetchMediaData = ({
	files,
	...reactQueryProps
}: useFetchMediaDataProps) => {
	return useQuery<MediaTypeAndDownloadUrl[], Error>({
		queryKey: [files],
		queryFn: () => fetchMediaData(files),
		...reactQueryProps,
	});
};
