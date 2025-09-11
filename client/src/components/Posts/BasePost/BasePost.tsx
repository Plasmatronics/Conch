import { Separator, Box, Flex, Card, Spinner } from "@chakra-ui/react";
import { LikeCommentShare } from "../../Buttons";
import React, { useState } from "react";
import { BasePostProps } from "./BasePost.types";
import { PostGalleryModal } from "../PostGalleryModal";
import { ExpandableText } from "../../Typography";
import { BasePostHeader, BasePostSkeleton } from "./Fragments";

const MAX_CHARS_BEFORE_TRUNCATION = 1500;

export const BasePost = ({
	avatar,
	title,
	user,
	relationship,
	year,
	headerRight,
	onLocationClick,
	isLiked,
	setIsLiked,
	loading,
	likeCommentShareProps,
	text,
	media,
	postGalleryModalProps,
	...cardRootProps
}: BasePostProps) => {
	const [isMediaLoading, setIsMediaLoading] = useState(!!media);
	const [hasMediaStartedLoading, setHasMediaStartedLoading] = useState(!media);
	const isContentLoading = loading || isMediaLoading;

	const headerProps = {
		avatar,
		title,
		user,
		relationship,
		year,
		headerRight,
		onLocationClick,
	};

	const handleStartMediaLoad = () => {
		setHasMediaStartedLoading(true);
	};

	const handleLoad = () => {
		setIsMediaLoading(false);
	};

	return (
		<Card.Root width="100%" {...cardRootProps}>
			<Card.Body
				width="100%"
				height="100%"
				minH={hasMediaStartedLoading ? "auto" : "30rem"}
				p={isContentLoading ? "0rem" : "auto"}
				position="relative"
			>
				{!hasMediaStartedLoading && (
					<Box
						position="absolute"
						top="50%"
						left="50%"
						transform="translate(-50%, -50%)"
					>
						<Spinner
							width="10rem"
							height="10rem"
							color="gray.200"
							borderWidth="5px"
							animationDuration="0.7s"
						/>
					</Box>
				)}
				<BasePostSkeleton
					opacity={!hasMediaStartedLoading ? 0 : 1}
					pointerEvents={!hasMediaStartedLoading ? "none" : "auto"}
					loading={isContentLoading}
				>
					{!isContentLoading && BasePostHeader({ ...headerProps })}
					<Flex
						direction="column"
						width="100%"
						height="100%"
						p={isContentLoading ? "1.5rem" : "auto"}
						justifyContent="center"
						alignItems="center"
					>
						<Box mb="2rem" width="100%" height="100%">
							{!isContentLoading && text && (
								<ExpandableText
									text={text}
									maxCharCount={MAX_CHARS_BEFORE_TRUNCATION}
								/>
							)}
							{media && (
								<PostGalleryModal
									media={media}
									{...postGalleryModalProps}
									postGalleryProps={{
										onAllMediaLoaded: handleLoad,
										onLoadStart: handleStartMediaLoad,
										loading: isContentLoading,
									}}
								/>
							)}
						</Box>
						{!isContentLoading && (
							<Box width="100%">
								<Separator mx="auto" width="95%" pb="0.5rem" />
								<LikeCommentShare
									{...likeCommentShareProps}
									isLiked={isLiked}
									setIsLiked={setIsLiked}
								/>
							</Box>
						)}
					</Flex>
				</BasePostSkeleton>
			</Card.Body>
		</Card.Root>
	);
};
