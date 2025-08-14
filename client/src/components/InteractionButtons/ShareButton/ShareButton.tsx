import { IconButton } from "@chakra-ui/react";
import { ShareButtonProps } from "./ShareButton.types";
import { FaComment, FaShare } from "react-icons/fa";
import { MagneticClickWrapper } from "../../AnimationWrapper";

export const ShareButton = ({ ref, ...iconButtonProps }: ShareButtonProps) => {
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
				<FaShare />
			</MagneticClickWrapper>
		</IconButton>
	);
};
