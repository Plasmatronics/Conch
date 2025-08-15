import { IconButton } from "@chakra-ui/react";
import { ShareButtonProps } from "./ShareButton.types";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { TbShare3 } from "react-icons/tb";

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
				<TbShare3 />
			</MagneticClickWrapper>
		</IconButton>
	);
};
