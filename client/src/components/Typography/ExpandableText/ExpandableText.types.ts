import { BoxProps, TextProps } from "@chakra-ui/react";

export interface ExpandableTextProps extends TextProps {
	text: string;
	maxCharCount?: number;
	expansionTextProps?: BoxProps;
	shrinkable?: boolean;
	clickOnTextToggling?: boolean;
	prependText?: string;
	prependTextStyles?: TextProps;
	containerProps?: BoxProps;
}
