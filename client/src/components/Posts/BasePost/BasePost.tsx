import { Text, Card, HStack, Avatar, Stack, Separator } from "@chakra-ui/react";
import { LikeCommentShare } from "../../InteractionButtons";
import React from "react";
import { BasePostProps } from "./BasePost.types";

export const BasePost = ({
	avatar,
	title,
	user,
	relationship,
	year,
	children,
	headerRight,
	isLiked,
	setIsLiked,
	likeCommentShareProps,
	...cardRootProps
}: BasePostProps) => {
	return (
		<Card.Root width="100%" {...cardRootProps}>
			<Card.Body width="100%">
				<HStack width="100%" mb="1rem" gap="1rem">
					<Avatar.Root>
						<Avatar.Image src={avatar} alt={user} />
						<Avatar.Fallback name={user} />
					</Avatar.Root>
					<Stack gap="0rem">
						<Text lineClamp="1" fontWeight="semibold">
							{`${title} ${year && year.getFullYear()}`}
						</Text>
						<HStack>
							<Text color="gray.500" fontSize="xs">
								{user}
							</Text>
							<Text color="gray.500" fontSize="xs">
								{relationship}
							</Text>
						</HStack>
					</Stack>
					{headerRight}
				</HStack>
				{children}
			</Card.Body>
			<Separator mx="auto" width="95%" pb="0.5rem" />
			<Card.Footer width="100%" pb="0.5rem">
				<LikeCommentShare
					{...likeCommentShareProps}
					isLiked={isLiked}
					setIsLiked={setIsLiked}
				/>
			</Card.Footer>
		</Card.Root>
	);
};
