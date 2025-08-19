import { GridItemProps, GridProps, ImageProps } from "@chakra-ui/react";
import { VideoPlayerProps } from "components/Media";

export type MediaType = "Image" | "Video";

type SafeGridItemProps = Omit<
	GridItemProps,
	// dont want to interfere with VideoPlayer props
	"gridArea" | "key" | "colorPalette" | "aspectRatio" | "src"
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
export type ImageMediaItem = { type: "Image" } & BaseMediaItem &
	Omit<ImageProps, "src">;

export type VideoMediaItem = { type: "Video" } & BaseMediaItem &
	Omit<VideoPlayerProps, "src">;

export type MediaItem = ImageMediaItem | VideoMediaItem;

export type MediaNode = MediaItem & {
	index?: number;
	dimensions: MediaDimensions;
};

export interface PostGalleryProps extends GridProps {
	media: MediaItem[];
	uniformGridItemProps?: SafeGridItemProps;
}
