import { IconButton } from "@chakra-ui/react";
import { ShareButtonProps } from "./ShareButton.types";
import { FaShare } from "react-icons/fa";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export const ShareButton = ({ ref, ...iconButtonProps }: ShareButtonProps) => {
	return (
		<IconButton
			aria-label="Comment"
			className="group"
			layerStyle="interactionButton"
			{...iconButtonProps}
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<FaShare />
			</MagneticClickWrapper>
		</IconButton>
	);
};
