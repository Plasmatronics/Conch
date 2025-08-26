import { Box } from "@chakra-ui/react";
import { MagneticClickWrapperProps } from "./MagneticClickWrapper.types";

export const MagneticClickWrapper = ({
	children,
	...boxProps
}: MagneticClickWrapperProps) => {
	return (
		<Box
			transition="transform 0.15s ease"
			_groupHover={{ transform: "translateY(-3px)" }}
			_groupActive={{ transform: "translateY(1px) scale(0.95)" }}
			{...boxProps}
		>
			{children}
		</Box>
	);
};
