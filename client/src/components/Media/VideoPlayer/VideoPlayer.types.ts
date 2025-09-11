import { BoxProps } from "@chakra-ui/react";
import type {
	MediaPlayerProps,
	TrackProps,
	ThumbnailProps,
} from "@vidstack/react";
import type { DefaultVideoLayoutProps } from "@vidstack/react/player/layouts/default";

/**
 * VideoPlayerProps
 *
 * See https://vidstack.io/docs/player/?styling=default-theme for more information on underlying component customization
 */
export interface VideoPlayerProps extends Omit<BoxProps, "colorPalette"> {
	title?: MediaPlayerProps["title"];
	onlyPoster?: boolean;
	src: MediaPlayerProps["src"];
	poster?: string;
	thumbnails?: ThumbnailProps["src"];
	tracks?: TrackProps[];
	colorPalette?: string;
	/** CSS overrides for the MediaPlayer, DefaultLayout.
	 * @see https://vidstack.io/docs/player/components/layouts/default-layout/?styling=default-theme#video-layout for variables
	 * */
	cssOverrides?: { [key: string]: string };
	mediaPlayerProps?: Omit<
		MediaPlayerProps,
		"children" | "aspectRatio" | "title" | "src"
	>;
	/** Optional override for DefaultLayout control icons */
	icons?: DefaultVideoLayoutProps["icons"];
	aspectRatio?: MediaPlayerProps["aspectRatio"];
	defaultVideoLayoutProps?: Omit<DefaultVideoLayoutProps, "icons" | "ref">;
	ref?: MediaPlayerProps["ref"];
}
