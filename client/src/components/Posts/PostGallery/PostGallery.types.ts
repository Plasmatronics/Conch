export type MediaTypes = "Image" | "Video";

export interface IMediaDimensions {
	type: MediaTypes;
	src: string;
	width: number;
	height: number;
}

export interface PostGalleryProps {
	media: { type: MediaTypes; src: string }[];
}
