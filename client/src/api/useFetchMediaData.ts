import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { MediaTypeAndDownloadUrl, MediaTypeAndKey } from "@conch/shared";

type ReactQueryOptions = Omit<
	UseQueryOptions<Map<string, { downloadUrl: string; type: string }>>,
	"queryFn" | "queryKey"
>;

export interface MediaTypeAndDownloadUrlAndFileKey
	extends MediaTypeAndDownloadUrl {
	fileKey: string;
}

export interface useFetchMediaDataProps extends ReactQueryOptions {
	files: MediaTypeAndKey[];
}

const fetchSingleMediaData = async ({
	fileKey,
	type,
}: MediaTypeAndKey): Promise<MediaTypeAndDownloadUrlAndFileKey> => {
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
		return { downloadUrl: data.downloadUrl, type, fileKey };
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.message ?? err.message);
		}
		throw err;
	}
};

const fetchMediaData = async (
	files: MediaTypeAndKey[],
): Promise<Map<string, { downloadUrl: string; type: string }>> => {
	const imgRetrievalMap = new Map<
		string,
		{ downloadUrl: string; type: string }
	>();

	const fileData = await Promise.all(
		files.map((file) =>
			fetchSingleMediaData({
				fileKey: file.fileKey,
				type: file.type,
			}),
		),
	);

	fileData.map((data) => {
		imgRetrievalMap.set(data.fileKey, {
			downloadUrl: data.downloadUrl,
			type: data.type,
		});
	});

	return imgRetrievalMap;
};

export const useFetchMediaData = ({
	files,
	...reactQueryProps
}: useFetchMediaDataProps) => {
	return useQuery<
		Map<MediaTypeAndKey["fileKey"], { downloadUrl: string; type: string }>
	>({
		queryKey: [
			files
				.map((file) => `${file.type}: ${file.fileKey}`)
				.sort()
				.join(", "),
		],
		queryFn: () => fetchMediaData(files.filter(Boolean)),
		...reactQueryProps,
	});
};
