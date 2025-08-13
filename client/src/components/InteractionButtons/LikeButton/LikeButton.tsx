import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LikeButtonProps } from "./LikeButton.types";
import { FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import { MagneticClickWrapper } from "../../AnimationWrapper";

const LIKED_STYLES: IconButtonProps = {
	bg: "red.200",
	color: "red.400",
	_hover: {
		bg: "red.100",
	},
};

const UNLIKED_STYLES: IconButtonProps = {
	bg: "gray.200",
	color: "blue.900",
	_hover: {
		bg: "gray.100",
	},
};

export const LikeButton = ({
	isLiked,
	setIsLiked,
	ref,
	onClick,
	onToggle,
	...iconButtonProps
}: LikeButtonProps) => {
	const MotionFaHeart = motion(FaHeart);

	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
		onClick?.(e);
		if (!e.isDefaultPrevented()) {
			setIsLiked((prev) => {
				const next = !prev;
				onToggle?.(next);
				return next;
			});
		}
	}

	return (
		<IconButton
			aria-label={isLiked ? "Unlike Button" : "Like Button"}
			aria-pressed={isLiked}
			className="group"
			{...(isLiked ? LIKED_STYLES : UNLIKED_STYLES)}
			{...iconButtonProps}
			onClick={handleClick}
			ref={ref}
		>
			<MagneticClickWrapper>
				<MotionFaHeart
					animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
					transition={{ duration: 0.5 }}
				/>
			</MagneticClickWrapper>
		</IconButton>
	);
};
