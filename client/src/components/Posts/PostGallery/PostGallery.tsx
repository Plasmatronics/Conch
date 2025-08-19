import { Image, Grid, Box, Text } from "@chakra-ui/react";
import { MediaNode, PostGalleryProps } from "./PostGallery.types";
import React from "react";
import {
	getGridLayoutStyles,
	getVertMediaPrioArr,
	readMediaDimensions,
} from "./utils";
import { VideoPlayer } from "../../Media";

const MAX_MEDIA = 5;

const renderNode = ({ type, src }: MediaNode) => {
	const sharedStyles = {
		width: "100%",
		height: "100%",
		src,
	};
	return type === "Image" ? (
		<Image {...sharedStyles} />
	) : (
		<VideoPlayer {...sharedStyles} />
	);
};

export const PostGallery = ({
	media,
	uniformGridItemProps,
	...gridProps
}: PostGalleryProps) => {
	const [mediaNodeWithDimensions, setMediaNodeWithDimensions] = React.useState<
		Array<MediaNode>
	>([]);

	const firstFiveMedia = media.slice(0, MAX_MEDIA);
	const isGalleryClamped = media.length > firstFiveMedia.length;

	const gridLayoutStyles = getGridLayoutStyles(mediaNodeWithDimensions);
	const verticalMediaPrioArr = getVertMediaPrioArr(mediaNodeWithDimensions);

	React.useEffect(() => {
		Promise.all(firstFiveMedia.map((file) => readMediaDimensions(file))).then(
			(mediaWithDimensions) => {
				setMediaNodeWithDimensions(mediaWithDimensions);
			},
		);
	}, [media]);

	const handleGridClick = (e: React.MouseEvent) => {
		const cellClicked = (e.target as HTMLElement).closest("[data-grid-area]");

		const indexClicked = cellClicked
			?.getAttribute("data-grid-area")
			?.split("media")[1];
	};

	return (
		<Grid
			gap="0.25rem"
			{...gridProps}
			{...gridLayoutStyles}
			onClick={handleGridClick}
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
							key={`media${idx + 1}`}
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
							key={`media${idx + 1}`}
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
