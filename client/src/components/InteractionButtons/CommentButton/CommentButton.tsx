import { Box, IconButton } from "@chakra-ui/react";
import { CommentButtonProps } from "./CommentButton.types";
import { FaComment } from "react-icons/fa";

export const CommentButton = ({
	ref,
	...commentButtonProps
}: CommentButtonProps) => {
	return (
		<IconButton
			aria-label="Comment"
			bg="gray.200"
			color="blue.900"
			className="group"
			_hover={{
				bg: "gray.100",
			}}
			{...commentButtonProps}
			ref={ref}
		>
			<Box
				asChild
				transition="transform 0.15s ease"
				_groupHover={{ transform: "translateY(-3px)" }}
				_groupActive={{ transform: "translateY(1px) scale(0.95)" }}
			>
				<FaComment />
			</Box>
		</IconButton>
	);
};
