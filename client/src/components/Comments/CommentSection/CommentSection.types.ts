import { FlexProps } from "@chakra-ui/react";
import { CommentThreadProps } from "../CommentThread";

export interface CommentSectionProps extends FlexProps {
	commentThreads: CommentThreadProps[];
}
