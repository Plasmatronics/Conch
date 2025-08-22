import { SkeletonProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface ConchSkeletonProps extends SkeletonProps {
	children?: ReactNode;
}
