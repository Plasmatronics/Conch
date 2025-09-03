import { BoxProps } from "@chakra-ui/react";
import React from "react";

export interface ConveyorBeltProps extends Omit<BoxProps, "gap"> {
	children: React.ReactNode;
	speed?: number;
	gap?: React.CSSProperties["gap"];
	direction?: "left" | "right";
	onItemHover?: () => void;
	onItemLeave?: () => void;
}
