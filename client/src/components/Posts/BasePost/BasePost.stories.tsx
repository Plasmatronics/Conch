import type { Meta, StoryFn } from "@storybook/react-vite";

import { BasePostSkeleton } from "./Fragments";
import { BasePost } from "./BasePost";
import { BasePostHeaderProps, BasePostProps } from "./BasePost.types";
import { useEffect, useState } from "react";
import {
	horizVideo,
	postDefaults,
	threeHorizontalImages,
} from "../sharedStoryProps";
import { Card, Grid, Skeleton } from "@chakra-ui/react";
import { longComment, fewReplies, manyReplies } from "../../Comments";
import { pileAvatars } from "../../Elements";

const commentSectionProps: BasePostProps["commentSectionProps"] = {
	commentThreads: [
		{
			comment: {
				comment: longComment,
				replies: fewReplies,
			},
			facePileAvatars: pileAvatars,
		},
		{
			comment: {
				comment: longComment,
				replies: manyReplies,
			},
			facePileAvatars: pileAvatars,
		},
	],
};

export default {
	title: "Posts/BasePost",
	component: BasePost,
} satisfies Meta<typeof BasePost>;

const Template: StoryFn<BasePostProps> = (args) => {
	const [isLiked, setIsLiked] = useState(false);
	return (
		<BasePost
			{...postDefaults}
			{...args}
			commentSectionProps={commentSectionProps}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
		/>
	);
};
export const StoryPost = Template.bind({});
StoryPost.args = {
	text: `
			Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea?`,
};

export const ShortPost = Template.bind({});
ShortPost.args = {
	text: "Apollo is my favorite mythological character!",
};

export const NoFacePile = Template.bind({});
NoFacePile.args = {
	facePileAvatars: undefined,
	text: "Apollo is my favorite mythological character!",
};

export const LongPost = Template.bind({});
LongPost.args = {
	text: `
			Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea? Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea?`,
};

export const Video = Template.bind({});
Video.args = {
	media: [{ src: "https://www.youtube.com/embed/QhBnZ6NPOY0", type: "video" }],
};

export const MediaPost = Template.bind({});
MediaPost.args = {
	media: [...threeHorizontalImages],
};

export const ManyMediaPost = Template.bind({});
ManyMediaPost.args = {
	media: [...threeHorizontalImages, horizVideo, ...threeHorizontalImages],
};

export const FullPost = Template.bind({});
FullPost.args = {
	media: [...threeHorizontalImages, horizVideo, ...threeHorizontalImages],
	text: `
			Lorem ipsum dolor, sit amet consectetur adipisicing elit. Alias, nulla
			ullam quod eligendi voluptatum aut eum assumenda obcaecati. Fugit numquam
			magni enim doloremque aspernatur nostrum adipisci ipsam cumque, qui
			tempore. Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi
			laborum, nam exercitationem explicabo incidunt maiores. Error nostrum
			possimus natus excepturi nihil laborum eum animi quas aliquid! Maiores
			exercitationem aut ea?`,
};

export const ThreeSecExternalLoadText = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsLoading(false);
		}, 3000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<BasePost
			{...(postDefaults as BasePostHeaderProps)}
			text="Apollo is my favorite mythological character!"
			loading={isLoading}
			numLikes={112}
			commentSectionProps={commentSectionProps}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
		/>
	);
};

export const ThreeSecExternalLoadMedia = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsLoading(false);
		}, 3000);

		return () => clearTimeout(timeout);
	}, []);

	return (
		<BasePost
			{...(postDefaults as BasePostHeaderProps)}
			text="Apollo is my favorite mythological character!"
			media={[...threeHorizontalImages]}
			commentSectionProps={commentSectionProps}
			loading={isLoading}
			numLikes={112}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
		/>
	);
};

export const PostSkeleton = () => {
	return (
		<Card.Root width="100%">
			<BasePostSkeleton loading={true}>
				<Card.Body width="100%">
					<Grid
						width="100%"
						height="20rem"
						gap="0.25rem"
						templateColumns="1fr 1fr"
						templateRows="1fr 1fr"
					>
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} loading={true} />
						))}
					</Grid>
				</Card.Body>
			</BasePostSkeleton>
		</Card.Root>
	);
};
