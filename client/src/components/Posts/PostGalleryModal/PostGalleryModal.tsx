import { Box, Dialog, Flex, Image } from "@chakra-ui/react";
import { PostGalleryModalProps } from "./PostGalleryModal.types";
import { useState } from "react";
import { PostGallery } from "../PostGallery/PostGallery";
import { MAX_MEDIA } from "../PostGallery/utils";
import { useGalleryMedia } from "../useGalleryMedia";
import { MediaItem } from "../PostGallery/PostGallery.types";
import { VideoPlayer } from "../../Media";
import { Carousel } from "../../Motion";
import { CloseButton, FullscreenButton } from "../../Buttons";

const renderCarouselChildren = (
	media: Omit<MediaItem, "gridItemProps" | "colorPalette" | "aspectRatio">,
) => {
	const sharedStyles = {
		w: "100%",
		h: "100%",
		maxW: "100vw",
		maxH: "100vh",
		objectFit: "scale-down",
	};
	if (media.type === "Image") {
		//destructure to sanitize
		const { type, src, ...img } = media;
		return <Image src={src} {...sharedStyles} {...img} />;
	} else {
		const {
			//destructure to sanitize
			type,
			src,
			...vid
		} = media;
		return <VideoPlayer src={src} {...sharedStyles} {...vid} />;
	}
};

export const PostGalleryModal = ({
	media,
	rightSection,
	carouselProps,
	postGalleryProps,
	...dialogRootProps
}: PostGalleryModalProps) => {
	const [isCarouselOpen, setIsCarouselOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [carouselIndex, setCarouselIndex] = useState(0);

	const { verticalMediaPrioArr } = useGalleryMedia(media);
	const restMedia = media.slice(0, MAX_MEDIA);
	const allMedia = [...verticalMediaPrioArr, ...restMedia];

	function handleGalleryClick(e: React.MouseEvent) {
		const clickedTarget = e.currentTarget;
		if (clickedTarget.getAttribute("data-component-type") !== "PostGallery")
			return;

		const elementClicked = Array.from(
			clickedTarget.querySelectorAll<HTMLElement>("[data-grid-area]"),
		).find((el) => el.contains(e.target as Node));
		if (!elementClicked) return;

		const mediaIndexClicked = elementClicked
			?.getAttribute("data-grid-area")
			?.split("media")[1];

		setCarouselIndex(Number(mediaIndexClicked) - 1);
		setIsCarouselOpen(true);
	}

	const handleCloseButtonClick = () => {
		setIsCarouselOpen(false);
	};

	return (
		<>
			<PostGallery
				{...postGalleryProps}
				cursor="pointer"
				media={media}
				onClick={handleGalleryClick}
			/>
			<Dialog.Root
				open={isCarouselOpen}
				{...dialogRootProps}
				size="full"
				motionPreset="none"
			>
				<Dialog.Positioner>
					<Dialog.Content overflow="hidden" width="100%" height="100%">
						<Dialog.Body width="100%" height="100%" bg="black" p="0" m="0">
							<Flex width="100%" height="100%">
								<Box
									flexGrow={1}
									flexBasis={isExpanded ? "100%" : "60%"}
									minW={0}
									height="100%"
									position="relative"
									transition="flex-basis 200ms ease"
								>
									<Carousel
										key={isExpanded ? "expanded" : "shrunk"}
										height="100%"
										width="100%"
										currentIndex={carouselIndex}
										setCurrentIndex={setCarouselIndex}
										{...carouselProps}
									>
										{allMedia.map((m) => renderCarouselChildren(m))}
									</Carousel>

									<FullscreenButton
										isExpanded={isExpanded}
										setIsExpanded={setIsExpanded}
										position="absolute"
										top={1}
										right={2}
										zIndex={1403}
									/>
									<CloseButton
										onClick={handleCloseButtonClick}
										position="absolute"
										top={0}
										left={0}
										zIndex={1403}
									/>
								</Box>
								{!isExpanded && rightSection && (
									<Box
										asChild
										zIndex={1402}
										height="100%"
										flex="0 0 40%"
										transition="flex-basis 200ms ease"
									>
										{rightSection}
									</Box>
								)}
							</Flex>
						</Dialog.Body>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</>
	);
};
