import { BoxProps, FlexProps } from "@chakra-ui/react";
import React from "react";

export interface ConveyorBeltProps extends Omit<BoxProps, "gap"> {
	children: React.ReactNode;
	speed?: number;
	gap?: FlexProps["gap"];
}
