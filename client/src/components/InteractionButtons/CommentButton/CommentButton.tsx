import { IconButton } from "@chakra-ui/react";
import { CommentButtonProps } from "./CommentButton.types";
import { TbMessageCircle } from "react-icons/tb";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export const CommentButton = ({
	ref,
	...iconButtonProps
}: CommentButtonProps) => {
	return (
		<IconButton
			aria-label="Comment"
			className="group"
			layerStyle="interactionButton"
			{...iconButtonProps}
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbMessageCircle />
			</MagneticClickWrapper>
		</IconButton>
	);
};
