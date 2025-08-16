import React, { useState } from "react";
import { BasePost } from "../BasePost";
import { StoryPostProps } from "./StoryPost.types";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { TbMapPin } from "react-icons/tb";

const MAX_CHARS_PER_STORY = 1500;

export const StoryPost = ({
	isLiked,
	setIsLiked,
	content,
	onLocationClick,
	...basePostProps
}: StoryPostProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const truncatedString = content.slice(0, MAX_CHARS_PER_STORY + 1);
	const truncatedContent = (
		<Text>
			{truncatedString}...{" "}
			<Box
				as="span"
				fontWeight="semibold"
				_hover={{ textDecoration: "underline" }}
			>
				See More
			</Box>
		</Text>
	);
	const nonTruncatedContent = <Text>{content}</Text>;

	let renderedContent;
	if (content !== truncatedString) {
		renderedContent = isExpanded ? nonTruncatedContent : truncatedContent;
	} else {
		renderedContent = nonTruncatedContent;
	}

	const handlePostExpansion = () => {
		setIsExpanded((prev) => {
			return prev ? prev : true;
		setIsExpanded(true);
	};

	return (
		<BasePost
			{...basePostProps}
			isLiked={isLiked}
			setIsLiked={setIsLiked}
			headerRight={
				<IconButton
					onClick={onLocationClick}
					layerStyle="interactionButton"
					className="group"
				>
					<MagneticClickWrapper asChild>
						<TbMapPin />
					</MagneticClickWrapper>
				</IconButton>
			}
		>
			<Box onClick={handlePostExpansion}>{renderedContent}</Box>
		</BasePost>
	);
};
