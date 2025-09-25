import { Text, Box } from "@chakra-ui/react";
import { useState } from "react";
import { ExpandableTextProps } from "./ExpandableText.types";

export const ExpandableText = ({
	text,
	maxCharCount = 500,
	expansionTextProps,
	shrinkable = false,
	clickOnTextToggling = true,
	containerProps,
	prependElement,
	...textProps
}: ExpandableTextProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const handlePostExpansion = () => {
		setIsExpanded((prev) => (shrinkable ? !prev : true));
	};
	const truncatedString = text?.slice(0, maxCharCount);
	const isTruncated =
		truncatedString && text && truncatedString?.length < text?.length;

	return (
		<Box
			width="100%"
			{...containerProps}
			onClick={clickOnTextToggling ? handlePostExpansion : undefined}
		>
			<Text {...textProps}>
				{prependElement} {isTruncated && !isExpanded ? truncatedString : text}
				{isTruncated && (shrinkable || !isExpanded) && (
					<>
						{" "}
						<Box
							as="button"
							fontWeight="semibold"
							_hover={{ textDecoration: "underline" }}
							onClick={!clickOnTextToggling ? handlePostExpansion : undefined}
							{...expansionTextProps}
						>
							{`... ${shrinkable && isExpanded ? "See Less" : "See More"}`}
						</Box>
					</>
				)}
			</Text>
		</Box>
	);
};
