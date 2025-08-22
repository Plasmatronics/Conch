import {
	Text,
	Card,
	HStack,
	Avatar,
	Stack,
	Separator,
	Box,
	IconButton,
	Flex,
} from "@chakra-ui/react";
import { LikeCommentShare } from "../../Buttons";
import React, { useState } from "react";
import { BasePostProps } from "./BasePost.types";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { TbMapPin } from "react-icons/tb";
import { PostGalleryModal } from "../PostGalleryModal";
import { BasePostSkeleton } from "./BasePostSkeleton";

const MAX_CHARS_BEFORE_TRUNCATION = 1500;

export const BasePost = ({
	avatar,
	title,
	user,
	relationship,
	year,
	headerRight,
	isLiked,
	setIsLiked,
	likeCommentShareProps,
	text,
	onLocationClick,
	media,
	postGalleryModalProps,
	...cardRootProps
}: BasePostProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isLoading, setIsLoading] = useState(!!media);
	const [hasMediaStartedLoading, setHasMediaStartedLoading] = useState(false);

	const truncatedString = text?.slice(0, MAX_CHARS_BEFORE_TRUNCATION);
	const isTruncated =
		truncatedString && text && truncatedString?.length < text?.length;

	const renderedTextContent = (
		<Text>
			{isTruncated && !isExpanded ? truncatedString : text}
			{isTruncated && !isExpanded && (
				<Box
					as="span"
					fontWeight="semibold"
					_hover={{ textDecoration: "underline" }}
				>
					... See More
				</Box>
			)}
		</Text>
	);

	const handlePostExpansion = () => {
		setIsExpanded(true);
	};

	const handleStartMediaLoad = () => {
		setHasMediaStartedLoading(true);
	};

	const handleLoad = () => {
		setIsLoading(false);
	};

	return (
		<Card.Root
			width="100%"
			{...cardRootProps}
			opacity={media && !hasMediaStartedLoading ? 0 : 100}
		>
			<BasePostSkeleton width="100%" height="100%" loading={isLoading}>
				<Card.Body width="100%">
					{!isLoading && (
						<HStack width="100%" mb="1rem" gap="1rem">
							<Avatar.Root size="xl">
								<Avatar.Image src={avatar} alt={user} />
								<Avatar.Fallback name={user} />
							</Avatar.Root>
							<Stack gap="0rem">
								<Text lineClamp="1" fontWeight="semibold">
									{`${title} ${year && year.getFullYear()}`}
								</Text>
								<HStack>
									<Text color="gray.500" fontSize="xs">
										{user}
									</Text>
									<Text color="gray.500" fontSize="xs">
										{relationship}
									</Text>
								</HStack>
							</Stack>
							{headerRight || (
								<IconButton
									onClick={onLocationClick}
									layerStyle="interactionButton"
									className="group"
								>
									<MagneticClickWrapper asChild>
										<TbMapPin />
									</MagneticClickWrapper>
								</IconButton>
							)}
						</HStack>
					)}
					<Flex
						direction="column"
						width="100%"
						height="100%"
						justifyContent="center"
						alignItems="center"
					>
						<Box mb="2rem" width="100%" height="100%">
							{!isLoading && (
								<Box width="100%" onClick={handlePostExpansion} mb="1.5rem">
									{renderedTextContent}
								</Box>
							)}
							{media && (
								<PostGalleryModal
									media={media}
									{...postGalleryModalProps}
									postGalleryProps={{
										onAllMediaLoaded: handleLoad,
										onLoadStart: handleStartMediaLoad,
									}}
								/>
							)}
						</Box>
						{!isLoading && (
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
				</Card.Body>
			</BasePostSkeleton>
		</Card.Root>
	);
};
