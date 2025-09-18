import { AvatarGroupProps } from "@chakra-ui/react";

export interface FacePileAvatar {
	fallback: string;
	url: string;
}

export interface FacePileProps extends AvatarGroupProps {
	avatars: FacePileAvatar[];
	text?: string;
	numAvatars?: number;
}
