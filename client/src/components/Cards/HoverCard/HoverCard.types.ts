import { AvatarImageProps, HoverCardRootProps } from "@chakra-ui/react";

export interface HoverCardProps extends Omit<HoverCardRootProps, "children"> {
	avatar: AvatarImageProps["src"];
	trigger: React.ReactNode;
	relationship: string;
	overview?: string;
	name: string;
	numMemories: number;
}
