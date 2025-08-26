import { IconButton } from "@chakra-ui/react";
import { CloseButtonProps } from "./CloseButton.types";
import { TbX } from "react-icons/tb";
import { MagneticClickWrapper } from "../../AnimationWrappers";

export const CloseButton = ({
	ref,
	strokeWidth,
	...iconButtonProps
}: CloseButtonProps) => {
	return (
		<IconButton
			bg="transparent"
			color="gray.300"
			_hover={{
				color: "gray.100",
			}}
			{...iconButtonProps}
			aria-label="Close"
			className="group"
			ref={ref}
		>
			<MagneticClickWrapper asChild>
				<TbX strokeWidth={strokeWidth || "3px"} />
			</MagneticClickWrapper>
		</IconButton>
	);
};
