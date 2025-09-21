import { Image, Grid, Box, Text, Skeleton } from "@chakra-ui/react";
import { MediaNode, PostGalleryProps } from "./PostGallery.types";
import React from "react";
import { MAX_MEDIA } from "./utils";
import { VideoPlayer } from "../../Media";
import { useGalleryMedia } from "../useGalleryMedia";

export const PostGallery = ({
	media,
	uniformGridItemProps,
	onAllMediaLoaded,
	onLoadStart,
	loading,
	onItemClick,
	isVideoPlayable = true,
	...gridProps
}: PostGalleryProps) => {
	const [numLoaded, setNumLoaded] = React.useState(0);

	const { gridLayoutStyles, verticalMediaPrioArr, isGalleryClamped } =
		useGalleryMedia(media);

	const targetCount = Math.min(MAX_MEDIA, media.length);

	const handleLoad = () => {
		setNumLoaded((prev) => Math.min(prev + 1, targetCount));
	};

	React.useEffect(() => {
		if (numLoaded >= targetCount) {
			onAllMediaLoaded?.();
		}
	}, [numLoaded, targetCount, onAllMediaLoaded]);

	const renderNode = (node: MediaNode) => {
		if (node.type !== "video") {
			//destructure to sanitize
			const {
				type,
				src,
				gridItemProps,
				uniformGridItemProps,
				dimensions,
				index,
				...img
			} = node;

			return (
				<Image
					src={src}
					width="100%"
					height="100%"
					borderRadius="sm"
					{...img}
					onError={() => {
						//img doesnt emit onLoadStart to just simulate here
						onLoadStart?.();
						handleLoad?.();
					}}
					onLoad={() => {
						//img doesnt emit onLoadStart to just simulate here
						onLoadStart?.();
						handleLoad?.();
					}}
				/>
			);
		} else {
			const {
				//destructure to sanitize
				type,
				src,
				gridItemProps,
				uniformGridItemProps,
				dimensions,
				index,
				...vid
			} = node;
			return (
				<VideoPlayer
					src={src}
					width="100%"
					height="100%"
					{...vid}
					mediaPlayerProps={{
						onError: handleLoad,
						onLoadedData: handleLoad,
						onLoadStart: onLoadStart,
					}}
					onlyPoster={isVideoPlayable ? false : true}
				/>
			);
		}
	};

	return (
		<Grid
			gap="0.25rem"
			width="100%"
			height="100%"
			data-component-type="PostGallery"
			{...gridProps}
			{...gridLayoutStyles}
		>
			{verticalMediaPrioArr.map((file, idx) => {
				if (isGalleryClamped && idx === MAX_MEDIA - 1) {
					return (
						<Box
							{...uniformGridItemProps}
							{...file.gridItemProps}
							width="100%"
							height="100%"
							gridArea={`media${idx + 1}`}
							onClick={() => onItemClick?.(idx)}
							key={`${file.src}-${idx}`}
							position="relative"
						>
							<Skeleton
								width="100%"
								height="100%"
								loading={
									loading || numLoaded < Math.min(MAX_MEDIA, media.length)
								}
							>
								{renderNode({ ...file })}
								<Box
									width="100%"
									height="100%"
									zIndex="overlay"
									position="absolute"
									bg="blackAlpha.600"
									_hover={{
										bg: "blackAlpha.700",
									}}
									left={0}
									top={0}
								/>
								<Text
									position="absolute"
									left="50%"
									top="50%"
									zIndex="overlay"
									pointerEvents="none"
									fontSize="3xl"
									color="white"
									transform="translate(-50%, -50%)"
								>{`+${media.length - MAX_MEDIA}`}</Text>
							</Skeleton>
						</Box>
					);
				} else {
					return (
						<Box
							{...uniformGridItemProps}
							{...file.gridItemProps}
							width="100%"
							height="100%"
							gridArea={`media${idx + 1}`}
							onClick={() => onItemClick?.(idx)}
							key={`${file.src}-${idx}`}
							asChild
						>
							<Skeleton
								width="100%"
								height="100%"
								loading={
									loading || numLoaded < Math.min(MAX_MEDIA, media.length)
								}
							>
								{renderNode({ ...file })}
							</Skeleton>
						</Box>
					);
				}
			})}
		</Grid>
	);
};
