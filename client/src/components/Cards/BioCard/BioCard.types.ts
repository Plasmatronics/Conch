import { CardBodyProps, CardRootProps } from "@chakra-ui/react";
import { MemberFavThings } from "@conch/shared";

interface IBioInfo {
	keyPhotoSrc: string;
	keyPhotoCaption?: string;
	name: string;
	relationship: string;
	birthYear: number;
	deathYear?: number;
	marriages: string[];
	favThings?: MemberFavThings;
	nicknames?: string[];
	occupations?: string[];
	formerResidences?: string[];
}

export interface BioCardProps extends CardRootProps {
	info: IBioInfo;
	cardBodyProps?: CardBodyProps;
}
