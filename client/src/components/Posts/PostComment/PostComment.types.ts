import { BoxProps } from "@chakra-ui/react";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface PostCommentProps extends Omit<BoxProps, "onSubmit"> {
	onSubmit?: React.FormEventHandler<HTMLFormElement>;
	placeholder?: string;
	avatar?: string;
	user: string;
	posting?: boolean;
	registerField: UseFormRegisterReturn;
	onHandleBackspace?: () => void;
}
