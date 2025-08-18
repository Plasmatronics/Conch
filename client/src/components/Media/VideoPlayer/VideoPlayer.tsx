import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider, Poster, Track } from "@vidstack/react";
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { VideoPlayerProps } from "./VideoPlayer.types";
import { Box } from "@chakra-ui/react";

export const VideoPlayer = ({
	title,
	src,
	poster,
	thumbnails,
	tracks,
	colorPalette,
	cssOverrides,
	mediaPlayerProps,
	icons,
	ref,
	aspectRatio,
	defaultVideoLayoutProps,
	...boxProps
}: VideoPlayerProps) => {
	return (
		<Box
			colorPalette={colorPalette || "blue"}
			width="100%"
			height="100%"
			css={{
				"--video-brand": "colors.colorPalette.600",

				"--media-brand": "colors.colorPalette.600",
				"--media-button-hover-bg": "colors.colorPalette.600",

				"--video-border-radius": "{radii.md}",
				"--video-font-family": "{fonts.body}",
				"--video-focus-ring-color": "colors.colorPalette.600",

				...cssOverrides,
			}}
			{...boxProps}
		>
			<MediaPlayer
				title={title}
				src={src}
				poster={poster}
				aspectRatio={aspectRatio || "16/9"}
				style={{
					width: "100%",
					height: "100%",
				}}
				{...mediaPlayerProps}
				ref={ref}
			>
				<MediaProvider>
					<Poster
						className="vds-poster"
						src={poster}
						alt={title}
						aria-hidden="true"
					/>
					{tracks &&
						tracks.map((track, index) => (
							<Track key={track.src || `Track-${index}`} {...track} />
						))}
				</MediaProvider>
				<DefaultVideoLayout
					thumbnails={thumbnails}
					{...defaultVideoLayoutProps}
					icons={icons || defaultLayoutIcons}
				/>
			</MediaPlayer>
		</Box>
	);
};
