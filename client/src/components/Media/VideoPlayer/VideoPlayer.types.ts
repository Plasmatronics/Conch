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
	/** Video source URL, provide an array if you want different quality options */
	src: MediaPlayerProps["src"];
	poster?: string;
	thumbnails?: ThumbnailProps["src"];
	/** Array of track objects (types include captions, subtitles, chapters) */
	tracks?: TrackProps[];
	/** ChakraUI Theme Color Palette, used to style controls */
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
