import { Avatar, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { BasePostHeaderProps } from "../BasePost.types";
import { TbMapPin } from "react-icons/tb";
import { MagneticClickWrapper } from "../../../AnimationWrappers";

export const BasePostHeader = ({
	avatar,
	title,
	user,
	relationship,
	storyDate,
	headerRight,
	onLocationClick,
	containerProps,
}: BasePostHeaderProps) => {
	return (
		<HStack width="100%" mb="1rem" gap="1rem" {...containerProps}>
			<Avatar.Root size="xl">
				<Avatar.Image src={avatar} alt={user} />
				<Avatar.Fallback name={user} />
			</Avatar.Root>
			<Stack gap="0rem">
				<Text lineClamp="1" fontWeight="semibold">
					{`${title} (${storyDate && new Date(storyDate).getFullYear()})`}
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
			{headerRight || (
				<IconButton
					onClick={onLocationClick}
					layerStyle="interactionButton"
					className="group"
					ml="auto"
				>
					<MagneticClickWrapper asChild>
						<TbMapPin />
					</MagneticClickWrapper>
				</IconButton>
			)}
		</HStack>
	);
};
