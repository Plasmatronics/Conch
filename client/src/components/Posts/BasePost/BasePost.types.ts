import { AvatarImageProps, CardRootProps } from "@chakra-ui/react";
import { LikeCommentShareProps } from "../../Buttons";
import { ReactNode } from "react";
import { MediaItem } from "../PostGallery";
import { PostGalleryModalProps } from "../PostGalleryModal";

export interface BasePostHeaderProps {
	user: string;
	avatar: AvatarImageProps["src"];
	title: string;
	relationship: string;
	year?: Date;
	headerRight?: ReactNode;
	onLocationClick?: () => void;
}

export interface BasePostProps
	extends Omit<CardRootProps, "content" | "title">,
		BasePostHeaderProps {
	likeCommentShareProps?: Omit<LikeCommentShareProps, "isLiked" | "setIsLiked">;
	isLiked: LikeCommentShareProps["isLiked"];
	setIsLiked: LikeCommentShareProps["setIsLiked"];
	loading?: boolean;
	text?: string;
	media?: MediaItem[];
	postGalleryModalProps?: Omit<PostGalleryModalProps, "media">;
}
