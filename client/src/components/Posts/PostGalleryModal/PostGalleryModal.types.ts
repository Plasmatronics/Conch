import { DialogRootProps } from "@chakra-ui/react";
import { CarouselProps } from "../../Motion/Carousel";
import React from "react";
import { PostGalleryProps } from "../PostGallery/PostGallery.types";

export interface PostGalleryModalProps extends DialogRootProps {
	media: PostGalleryProps["media"];
	rightSection?: React.ReactNode;
	carouselProps?: Omit<
		CarouselProps,
		"currentIndex" | "setCurrentIndex" | "children"
	>;
	postGalleryProps?: Omit<PostGalleryProps, "media">;
}
