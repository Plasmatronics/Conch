import { Image, Grid, Box, Text } from "@chakra-ui/react";
import { MediaNode, PostGalleryProps } from "./PostGallery.types";
import React from "react";
import { MAX_MEDIA } from "./utils";
import { VideoPlayer } from "../../Media";
import { useGalleryMedia } from "../useGalleryMedia";

const renderNode = (node: MediaNode) => {
	if (node.type === "Image") {
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
		return <Image src={src} width="100%" height="100%" {...img} />;
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
		return <VideoPlayer src={src} width="100%" height="100%" {...vid} />;
	}
};
export const PostGallery = ({
	media,
	uniformGridItemProps,
	...gridProps
}: PostGalleryProps) => {
	const { gridLayoutStyles, verticalMediaPrioArr, isGalleryClamped } =
		useGalleryMedia(media);

	return (
		<Grid
			gap="0.25rem"
			width="100%"
			height="100%"
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
								zIndex="popover"
								fontSize="3xl"
								color="white"
								transform="translate(-50%, -50%)"
							>{`+${media.length - MAX_MEDIA}`}</Text>
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
							{renderNode({ ...file })}
						</Box>
					);
				}
			})}
		</Grid>
	);
};
