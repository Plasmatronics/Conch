import { Image, Grid, Box, Text } from "@chakra-ui/react";
import {
	IMediaDimensions,
	MediaTypes,
	PostGalleryProps,
} from "./PostGallery.types";
import React from "react";
import {
	getGridLayoutStyles,
	getVertMediaPrioArr,
	readMediaDimensions,
} from "./utils";
import { VideoPlayer } from "../../Media";

const MAX_MEDIA = 5;

const renderNode = ({
	type,
	src,
	index,
}: {
	type: MediaTypes;
	src: string;
	index: number;
}) => {
	const sharedStyles = {
		width: "100%",
		height: "100%",
		gridArea: `media${index + 1}`,
		key: `media${index + 1}`,
		mb: "0.25rem",
		src,
	};
	return type === "Image" ? (
		<Image {...sharedStyles} />
	) : (
		<VideoPlayer aspectRatio="auto" {...sharedStyles} />
	);
};

export const PostGallery = ({ media }: PostGalleryProps) => {
	const [mediaDimensions, setMediaDimensions] = React.useState<
		Array<IMediaDimensions>
	>([]);
	const firstFiveMedia = media.slice(0, MAX_MEDIA);
	const isGalleryClamped = media.length > firstFiveMedia.length;
	const gridLayoutStyles = getGridLayoutStyles(mediaDimensions);
	const verticalMediaPrioArr = getVertMediaPrioArr(mediaDimensions);

	React.useEffect(() => {
		Promise.all(
			firstFiveMedia.map((file) => readMediaDimensions(file.type, file.src)),
		).then((dimensions) => {
			setMediaDimensions(dimensions);
		});
	}, [media]);

	return (
		<Grid gap="0.25rem" {...gridLayoutStyles}>
			{verticalMediaPrioArr.map((file, index) => {
				if (isGalleryClamped && index === MAX_MEDIA - 1) {
					return (
						<Box
							width="100%"
							height="100%"
							gridArea={`media${index + 1}`}
							key={`media${index + 1}`}
							position="relative"
						>
							{renderNode({ type: file.type, src: file.src, index: index })}
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
					return renderNode({ type: file.type, src: file.src, index: index });
				}
			})}
		</Grid>
	);
};
