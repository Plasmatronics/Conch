import { GridItemProps, GridProps, ImageProps } from "@chakra-ui/react";
import { VideoPlayerProps } from "components/Media";

export type MediaType = "image" | "video";

type SafeGridItemProps = Omit<
	GridItemProps,
	// dont want to interfere with VideoPlayer props
	| "gridArea"
	| "key"
	| "colorPalette"
	| "aspectRatio"
	| "src"
	| "onLoadStart"
	| "onError"
	| "onLoad"
>;

export interface MediaDimensions {
	width: number;
	height: number;
}

export interface BaseMediaItem {
	type: MediaType;
	src: string;
	gridItemProps?: SafeGridItemProps;
	uniformGridItemProps?: SafeGridItemProps;
}
export interface ImageMediaItem
	extends Omit<BaseMediaItem, "type">,
		Omit<ImageProps, "src"> {
	type: "image";
}

export interface VideoMediaItem
	extends Omit<BaseMediaItem, "type">,
		Omit<VideoPlayerProps, "src"> {
	type: "video";
}

export type MediaItem = ImageMediaItem | VideoMediaItem;

export type MediaNode = MediaItem & {
	index?: number;
	dimensions: MediaDimensions;
};

export interface PostGalleryProps
	extends Omit<GridProps, "onLoadStart" | "onError" | "onLoad"> {
	onLoadStart?: () => void;
	onAllMediaLoaded?: () => void;
	onItemClick?: (index: number) => void;
	isVideoPlayable?: boolean;
	loading?: boolean;
	media: MediaItem[];
	uniformGridItemProps?: SafeGridItemProps;
}
