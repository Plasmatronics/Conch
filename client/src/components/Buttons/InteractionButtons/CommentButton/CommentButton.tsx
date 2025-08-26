import { IconButton } from "@chakra-ui/react";
import { CommentButtonProps } from "./CommentButton.types";
import { TbMessageCircle } from "react-icons/tb";
import { MagneticClickWrapper } from "../../../AnimationWrappers";

export const CommentButton = ({
	ref,
	strokeWidth,
	...iconButtonProps
}: CommentButtonProps) => {
	return (
		<IconButton
			layerStyle="interactionButton"
			{...iconButtonProps}
			aria-label="Comment"
			className="group"
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbMessageCircle strokeWidth={strokeWidth || "2px"} />
			</MagneticClickWrapper>
		</IconButton>
	);
};
