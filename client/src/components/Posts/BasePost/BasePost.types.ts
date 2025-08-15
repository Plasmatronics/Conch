import { AvatarImageProps, CardRootProps } from "@chakra-ui/react";
import { LikeCommentShareProps } from "components/InteractionButtons";
import { ReactNode } from "react";

export interface BasePostProps extends Omit<CardRootProps, "content"> {
	children: ReactNode;
	user: string;
	avatar: AvatarImageProps["src"];
	title: string;
	relationship: string;
	year?: Date;
	headerRight?: ReactNode;
	likeCommentShareProps?: Omit<LikeCommentShareProps, "isLiked" | "setIsLiked">;
	isLiked: LikeCommentShareProps["isLiked"];
	setIsLiked: LikeCommentShareProps["setIsLiked"];
}
