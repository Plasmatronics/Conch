import { AvatarImageProps, HoverCardRootProps } from "@chakra-ui/react";

export interface HoverCardProps extends HoverCardRootProps {
	avatar: AvatarImageProps["src"];
	trigger: React.ReactNode;
	relationship: string;
	overview: string;
	user: string;
	numMemories: number;
}
