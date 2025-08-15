import { IconButtonProps } from "@chakra-ui/react";
import React from "react";

export interface LikeButtonProps extends Omit<IconButtonProps, "icon"> {
	isLiked: boolean;
	setIsLiked: React.Dispatch<React.SetStateAction<boolean>>;
	onToggle?: (nextValue: boolean) => void;
	ref?: React.Ref<HTMLButtonElement>;
}
