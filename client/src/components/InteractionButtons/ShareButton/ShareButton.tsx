import { IconButton } from "@chakra-ui/react";
import { ShareButtonProps } from "./ShareButton.types";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { TbShare3 } from "react-icons/tb";

export const ShareButton = ({ ref, ...iconButtonProps }: ShareButtonProps) => {
	return (
		<IconButton
			layerStyle="interactionButton"
			{...iconButtonProps}
			aria-label="Comment"
			className="group"
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbShare3 />
			</MagneticClickWrapper>
		</IconButton>
	);
};
