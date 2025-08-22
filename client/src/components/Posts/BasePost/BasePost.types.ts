import { AvatarImageProps, CardRootProps } from "@chakra-ui/react";
import { LikeCommentShareProps } from "../../Buttons";
import { ReactNode } from "react";
import { MediaItem } from "../PostGallery";
import { PostGalleryModalProps } from "../PostGalleryModal";

export interface BasePostProps extends Omit<CardRootProps, "content"> {
	user: string;
	avatar: AvatarImageProps["src"];
	title: string;
	relationship: string;
	year?: Date;
	headerRight?: ReactNode;
	likeCommentShareProps?: Omit<LikeCommentShareProps, "isLiked" | "setIsLiked">;
	isLiked: LikeCommentShareProps["isLiked"];
	setIsLiked: LikeCommentShareProps["setIsLiked"];
	text?: string;
	onLocationClick?: () => void;
	media?: MediaItem[];
	postGalleryModalProps?: Omit<PostGalleryModalProps, "media">;
}
