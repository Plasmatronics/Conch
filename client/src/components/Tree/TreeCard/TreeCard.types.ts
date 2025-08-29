import { ImageProps, CardRootProps, CardBodyProps } from "@chakra-ui/react";

export interface MemberData {
	name: string;
	numMemories: number;
	birthYear: number;
	deathYear?: number;
	image: ImageProps["src"];
}

export interface TreeCardProps
	extends Omit<CardRootProps, "size" | "width" | "height"> {
	cardBodyProps?: CardBodyProps;
	memberData: MemberData | MemberData[];
	width: CardRootProps["width"];
	height: CardRootProps["height"];
	onMemoriesClick?: () => void;
}
