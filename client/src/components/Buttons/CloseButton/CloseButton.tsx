import { IconButton } from "@chakra-ui/react";
import { CloseButtonProps } from "./CloseButton.types";
import { TbX } from "react-icons/tb";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export const CloseButton = ({
	ref,
	strokeWidth,
	...iconButtonProps
}: CloseButtonProps) => {
	return (
		<IconButton
			layerStyle="interactionButton"
			{...iconButtonProps}
			aria-label="Comment"
			className="group"
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbX strokeWidth={strokeWidth || "3px"} />
			</MagneticClickWrapper>
		</IconButton>
	);
};
