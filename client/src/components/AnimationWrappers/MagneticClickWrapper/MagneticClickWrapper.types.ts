import { BoxProps } from "@chakra-ui/react";
import React from "react";

export interface MagneticClickWrapperProps extends Omit<BoxProps, "children"> {
	children?: React.ReactNode;
}
