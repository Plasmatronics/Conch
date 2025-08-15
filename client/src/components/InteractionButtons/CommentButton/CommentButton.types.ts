import { IconButtonProps } from "@chakra-ui/react";
import React from "react";

export interface CommentButtonProps extends Omit<IconButtonProps, "icon"> {
	ref?: React.Ref<HTMLButtonElement>;
}
