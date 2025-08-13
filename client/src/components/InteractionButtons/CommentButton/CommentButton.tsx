import { IconButton } from "@chakra-ui/react";
import { CommentButtonProps } from "./CommentButton.types";
import { FaComment } from "react-icons/fa";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export const CommentButton = ({
	ref,
	...iconButtonProps
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
			{...iconButtonProps}
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<FaComment />
			</MagneticClickWrapper>
		</IconButton>
	);
};
