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
	storyDate,
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

	//fetching data, or at least represents the state in which we dont yet know what the layout looks like
	const isFetchingContent = loading || !hasMediaStartedLoading;

	const headerProps = {
		avatar,
		title,
		user,
		relationship,
		storyDate,
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
				minH={isFetchingContent ? "30rem" : "auto"}
				p={isFetchingContent ? "0rem" : "2rem"}
				position="relative"
			>
				{isFetchingContent && (
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
					//let skeleton be present but invisible so media load functions can run
					opacity={isFetchingContent ? 0 : 1}
					pointerEvents={isFetchingContent ? "none" : "auto"}
					containerProps={{ p: "auto" }}
					loading={isMediaLoading}
				>
					{!isMediaLoading && <BasePostHeader {...headerProps} />}
					<Flex
						direction="column"
						width="100%"
						height="100%"
						justifyContent="center"
						alignItems="center"
					>
						<Box mb="2rem" width="100%" height="100%">
							{!isMediaLoading && text && (
								<ExpandableText
									text={text}
									maxCharCount={MAX_CHARS_BEFORE_TRUNCATION}
									containerProps={{
										mb: "1.5rem",
									}}
								/>
							)}
							{media && (
								<PostGalleryModal
									media={media}
									{...postGalleryModalProps}
									postGalleryProps={{
										onAllMediaLoaded: handleLoad,
										onLoadStart: handleStartMediaLoad,
										loading: isMediaLoading,
									}}
								/>
							)}
						</Box>
						{!isMediaLoading && (
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
