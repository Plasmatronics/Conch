import type { Meta } from "@storybook/react-vite";
import { VideoPlayer } from "./VideoPlayer";

export default {
	title: "Media/VideoPlayer",
	component: VideoPlayer,
} satisfies Meta<typeof VideoPlayer>;

const defaultStyles = {
	title: "Sprite Fight",
	src: "https://files.vidstack.io/sprite-fight/720p.mp4",
	poster: "https://files.vidstack.io/sprite-fight/poster.webp",
};

export const Default = () => {
	return <VideoPlayer {...defaultStyles} />;
};

export const OrangePallette = () => {
	return <VideoPlayer {...defaultStyles} colorPalette="orange" />;
};

export const MultipleResolutions = () => {
	return (
		<VideoPlayer
			title="Sprite Fight"
			src={[
				{
					src: "https://files.vidstack.io/sprite-fight/1080p.mp4",
					type: "video/mp4",
					width: 1920,
					height: 1080,
				},
				{
					src: "https://files.vidstack.io/sprite-fight/720p.mp4",
					type: "video/mp4",
					width: 1280,
					height: 720,
				},
				{
					src: "https://files.vidstack.io/sprite-fight/480p.mp4",
					type: "video/mp4",
					width: 853,
					height: 480,
				},
			]}
			poster="https://files.vidstack.io/sprite-fight/poster.webp"
		/>
	);
};

export const WithSubtitles = () => {
	return (
		<VideoPlayer
			{...defaultStyles}
			tracks={[
				{
					src: "https://files.vidstack.io/sprite-fight/subs/english.vtt",
					label: "English",
					language: "en-US",
					kind: "subtitles",
					type: "vtt",
					default: true,
				},
				{
					src: "https://files.vidstack.io/sprite-fight/subs/spanish.vtt",
					label: "Spanish",
					language: "es-ES",
					kind: "subtitles",
					type: "vtt",
				},
				{
					src: "https://files.vidstack.io/sprite-fight/chapters.vtt",
					language: "en-US",
					kind: "chapters",
					type: "vtt",
					default: true,
				},
			]}
			thumbnails={"https://files.vidstack.io/sprite-fight/thumbnails.vtt"}
		/>
	);
};

export const YoutubeUrl = () => {
	return (
		<VideoPlayer
			title="Rick Roll"
			src="https://www.youtube.com/watch?v=q-Y0bnx6Ndw&list=RDq-Y0bnx6Ndw&start_radio=1"
		/>
	);
};
