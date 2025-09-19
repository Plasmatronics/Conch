import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	Flex,
	Text,
} from "@chakra-ui/react";
import { FacePileProps } from "./FacePile.types";
import React from "react";

export const FacePile = ({
	avatars,
	text,
	numAvatars = 3,
	...avatarGroupProps
}: FacePileProps) => {
	return (
		<Flex align="center" justify="center" gap="0.5rem">
			<AvatarGroup gapX="-1rem" size="sm" {...avatarGroupProps}>
				{avatars.slice(0, numAvatars).map((avatarObj, idx) => (
					<Avatar.Root key={`${avatarObj.fallback}-${idx}`}>
						<Avatar.Fallback name={avatarObj.fallback} />
						<Avatar.Image src={avatarObj.url} />
					</Avatar.Root>
				))}
			</AvatarGroup>
			{text && (
				<Text fontSize="xs" fontWeight="medium" color="gray.600">
					{text}
				</Text>
			)}
		</Flex>
	);
};
