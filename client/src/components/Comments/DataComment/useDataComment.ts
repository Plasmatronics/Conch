import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataCommentProps } from "./DataComment";
import { useFetchMemberData } from "../../../api";
import { PopulatedCommentAPIResponse } from "@conch/shared";

const fetchCommentData = async ({ commentId }: DataCommentProps) => {
	const { data } = await axios.get(
		`http://127.0.0.1:3000/api/v1/comments/${commentId}?include=replies`,
	);

	return data.data;
};

export const useDataComment = ({ commentId }: DataCommentProps) => {
	const commentQuery = useQuery<PopulatedCommentAPIResponse, Error>({
		queryKey: [commentId],
		queryFn: () => fetchCommentData({ commentId }),
	});

	const authorQuery = useFetchMemberData({
		personId: commentQuery.data ? commentQuery.data.author : "",
		enabled: !!commentQuery.data,
	});

	return { commentQuery, authorQuery };
};
