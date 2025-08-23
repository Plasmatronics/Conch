import { IconButton } from "@chakra-ui/react";
import { ShareButtonProps } from "./ShareButton.types";
import { MagneticClickWrapper } from "../../../AnimationWrappers";
import { TbShare3 } from "react-icons/tb";

export const ShareButton = ({
	ref,
	strokeWidth,
	...iconButtonProps
}: ShareButtonProps) => {
	return (
		<IconButton
			layerStyle="interactionButton"
			{...iconButtonProps}
			aria-label="Comment"
			className="group"
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbShare3 strokeWidth={strokeWidth || "2px"} />
			</MagneticClickWrapper>
		</IconButton>
	);
};
