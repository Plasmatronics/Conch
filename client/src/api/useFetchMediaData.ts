import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { MediaId } from "types";

const fetchSingleMediaData = async (id: MediaId) => {
	try {
		const { data: fileProperties } = await axios.get(
			`http://127.0.0.1:3000/api/v1/media/${id}`,
		);

		const { data: mediaData } = await axios.post(
			"http://127.0.0.1:3000/api/v1/files/download-url",
			{
				fileKey: fileProperties.fileKey,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
		return { ...mediaData, ...fileProperties.data };
	} catch (err: unknown) {
		throw new Error(
			(err as AxiosError).message || "Failed to fetch media data",
		);
	}
};

const fetchMediaData = async (ids: MediaId[]) => {
	return await Promise.all(ids.map((key: string) => fetchSingleMediaData(key)));
};

export const useFetchMediaData = (ids: MediaId[]) => {
	return useQuery({
		queryKey: [ids],
		queryFn: () => fetchMediaData(ids),
	});
};
