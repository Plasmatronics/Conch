import { Image, Grid, Box, Text, Skeleton } from "@chakra-ui/react";
import { MediaNode, PostGalleryProps } from "./PostGallery.types";
import React, { useState } from "react";
import { MAX_MEDIA } from "./utils";
import { VideoPlayer } from "../../Media";
import { useGalleryMedia } from "../useGalleryMedia";

export const PostGallery = ({
	media,
	uniformGridItemProps,
	onAllMediaLoaded,
	onLoadStart,
	...gridProps
}: PostGalleryProps) => {
	const [numLoaded, setNumLoaded] = useState(0);

	const { gridLayoutStyles, verticalMediaPrioArr, isGalleryClamped } =
		useGalleryMedia(media);

	const handleLoad = () => {
		setNumLoaded((prev) => {
			const next = prev + 1;
			if (next >= Math.min(MAX_MEDIA, media.length)) onAllMediaLoaded?.();

			return next;
		});
	};

	const renderNode = (node: MediaNode) => {
		if (node.type !== "Video") {
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
					onLoadStart={onLoadStart}
					onError={handleLoad}
					onLoad={handleLoad}
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
							data-grid-area={`media${idx + 1}`}
							key={file.src}
							position="relative"
						>
							<Skeleton
								width="100%"
								height="100%"
								loading={numLoaded < Math.min(MAX_MEDIA, media.length)}
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
							data-grid-area={`media${idx + 1}`}
							key={file.src}
							asChild
						>
							<Skeleton
								width="100%"
								height="100%"
								loading={numLoaded < Math.min(MAX_MEDIA, media.length)}
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
