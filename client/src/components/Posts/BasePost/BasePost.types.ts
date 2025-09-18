import { AvatarImageProps, CardRootProps, StackProps } from "@chakra-ui/react";
import { LikeCommentShareProps } from "../../Buttons";
import { ReactNode } from "react";
import { MediaItem } from "../PostGallery";
import { PostGalleryModalProps } from "../PostGalleryModal";
import { FacePileProps } from "../../Elements";

export interface BasePostHeaderProps {
	user: string;
	avatar: AvatarImageProps["src"];
	title: string;
	relationship: string;
	storyDate?: Date;
	headerRight?: ReactNode;
	onLocationClick?: () => void;
	containerProps?: StackProps;
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
	numLikes: number;
	facePileAvatars?: FacePileProps["avatars"];
	postGalleryModalProps?: Omit<PostGalleryModalProps, "media">;
}
