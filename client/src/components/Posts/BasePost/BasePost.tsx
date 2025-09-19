import { Box, Flex, Card, Spinner, Dialog, Portal } from "@chakra-ui/react";
import { LikeCommentShare } from "../../Buttons";
import React, { useState } from "react";
import { BasePostProps } from "./BasePost.types";
import { PostGalleryModal } from "../PostGalleryModal";
import { ExpandableText } from "../../Typography";
import { FacePile } from "../../Elements";
import { BasePostHeader, BasePostSkeleton } from "./Fragments";
import { CommentSection } from "../../Comments";

const MAX_CHARS_BEFORE_TRUNCATION = 1500;
const MAX_NUM_AVATARS_IN_FACEPILE = 3;

const BasePostWithoutComment = ({
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
	numLikes,
	facePileAvatars,
	likeCommentShareProps,
	text,
	commentSectionProps,
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

	const numLikesDisplayed =
		numLikes <= MAX_NUM_AVATARS_IN_FACEPILE
			? 0
			: numLikes - MAX_NUM_AVATARS_IN_FACEPILE;

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
						justifyContent="start"
						alignItems="center"
					>
						<Box mb="2rem" width="100%">
							{!isMediaLoading && text && (
								<ExpandableText
									mb="0.75rem"
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
										loading: isMediaLoading,
									}}
									rightSection={
										<CommentSection mt="1rem" {...commentSectionProps} />
									}
								/>
							)}
						</Box>
						{!isMediaLoading && facePileAvatars && (
							<Box mb="0.75rem" alignSelf="start">
								<FacePile
									avatars={facePileAvatars}
									numAvatars={MAX_NUM_AVATARS_IN_FACEPILE}
									text={
										numLikesDisplayed > 0
											? `+${numLikesDisplayed} Have Liked`
											: "Have Liked"
									}
								/>
							</Box>
						)}
						{!isMediaLoading && (
							<Box width="100%">
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

const BasePostWithComment = ({ ...props }: BasePostProps) => {
	const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

	const handleCommentClick = () => {
		setIsCommentModalOpen(true);
	};

	const handleCloseCommentModal = () => {
		setIsCommentModalOpen(false);
	};

	return (
		<>
			<BasePostWithoutComment
				{...props}
				likeCommentShareProps={{
					noBottomSeparator: true,
					commentButtonProps: {
						onClick: handleCommentClick,
					},
				}}
			/>
			<Dialog.Root
				open={isCommentModalOpen}
				motionPreset="none"
				scrollBehavior="inside"
				onEscapeKeyDown={handleCloseCommentModal}
				onPointerDownOutside={handleCloseCommentModal}
				size="tall"
			>
				<Portal>
					<Dialog.Backdrop style={{ pointerEvents: "auto" }} />
					<Dialog.Positioner>
						<Dialog.Content maxH="100vh" overflow="hidden">
							<Flex
								width="100%"
								height="100%"
								direction="column"
								overflowY="auto"
								overflowX="hidden"
								gap="0.5rem"
							>
								<BasePostWithoutComment border="none" {...props} />
								<CommentSection {...props.commentSectionProps} />
							</Flex>
						</Dialog.Content>
					</Dialog.Positioner>
				</Portal>
			</Dialog.Root>
		</>
	);
};

export { BasePostWithComment as BasePost };
