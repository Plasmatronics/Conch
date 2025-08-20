import { IconButtonProps } from "@chakra-ui/react";
import React, { CSSProperties } from "react";

export interface BaseButtonProps extends Omit<IconButtonProps, "icon"> {
	strokeWidth?: CSSProperties["fontSize"];
	ref?: React.Ref<HTMLButtonElement>;
}
