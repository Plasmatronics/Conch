import { GridItemProps, GridProps, ImageProps } from "@chakra-ui/react";

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

export interface BaseMediaItem extends Omit<ImageProps, "src"> {
	type: MediaType;
	src: string;
	gridItemProps?: SafeGridItemProps;
	uniformGridItemProps?: SafeGridItemProps;
}

export interface MediaNode extends BaseMediaItem {
	index?: number;
	dimensions: MediaDimensions;
}

export interface PostGalleryProps extends GridProps {
	media: BaseMediaItem[];
	uniformGridItemProps?: SafeGridItemProps;
}
