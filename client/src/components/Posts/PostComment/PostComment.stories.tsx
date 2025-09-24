import type { Meta } from "@storybook/react-vite";
import React from "react";
import { Box } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import { PostComment } from "./PostComment";
import { DataPostCommentInputs } from "../DataPost";

export default {
	title: "Posts/PostComment",
	component: PostComment,
} satisfies Meta<typeof PostComment>;

const ScrollDemo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		overflowY="auto"
		height="16rem"
		border="1px solid"
		borderColor="gray.200"
	>
		<Box height="200vh" bg="red.50" />
		{children}
	</Box>
);

export const Default = () => {
	const { handleSubmit, reset, register } = useForm<DataPostCommentInputs>({
		defaultValues: { comment: "" },
	});
	const onSubmit = handleSubmit(({ comment }) => {
		console.log("Submitted comment:", comment);
		reset();
	});

	return (
		<ScrollDemo>
			<PostComment
				user="Jules"
				avatar="https://s.yimg.com/ny/api/res/1.2/0QYorOmF3ufQwqL03Y5IXA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyNDI7aD02OTk7Y2Y9d2VicA--/https://media.zenfs.com/en/comingsoon_net_477/8eac91586badf4ce58f7a5f3ff598cb5"
				placeholder="Comment…"
				registerField={register("comment")}
				onSubmit={onSubmit}
				position="sticky"
				bottom={0}
				bg="white"
				zIndex={1}
			/>
		</ScrollDemo>
	);
};

export const Loading = () => {
	const { register } = useForm<DataPostCommentInputs>({
		defaultValues: { comment: "" },
	});

	return (
		<ScrollDemo>
			<PostComment
				user="Jules"
				avatar="https://s.yimg.com/ny/api/res/1.2/0QYorOmF3ufQwqL03Y5IXA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyNDI7aD02OTk7Y2Y9d2VicA--/https://media.zenfs.com/en/comingsoon_net_477/8eac91586badf4ce58f7a5f3ff598cb5"
				placeholder="Comment…"
				registerField={register("comment")}
				posting
				position="sticky"
				bottom={0}
				bg="white"
				zIndex={1}
			/>
		</ScrollDemo>
	);
};
