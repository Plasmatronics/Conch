import { BoxProps, TextProps } from "@chakra-ui/react";
import React from "react";

export interface ExpandableTextProps extends TextProps {
	text: string;
	maxCharCount?: number;
	expansionTextProps?: BoxProps;
	shrinkable?: boolean;
	clickOnTextToggling?: boolean;
	prependElement?: React.ReactNode;
	containerProps?: BoxProps;
}
