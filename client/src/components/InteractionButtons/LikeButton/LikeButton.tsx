import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LikeButtonProps } from "./LikeButton.types";
import { motion } from "framer-motion";
import { MagneticClickWrapper } from "../../AnimationWrapper";
import { TbHeart, TbHeartFilled } from "react-icons/tb";

const LIKED_STYLES: IconButtonProps = {
	bg: "red.100",
	color: "red.500",
	_hover: { bg: "red.50" },
};

const UNLIKED_STYLES: IconButtonProps = {
	layerStyle: "interactionButton",
};

export const LikeButton = ({
	isLiked,
	setIsLiked,
	ref,
	onClick,
	onToggle,
	...iconButtonProps
}: LikeButtonProps) => {
	const HeartIcon = isLiked ? TbHeartFilled : TbHeart;
	const MotionHeart = motion(HeartIcon);

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
				<MotionHeart
					// slight “beat” on like; no animation on unlike
					animate={isLiked ? { scale: [1, 1.22, 1] } : { scale: 1 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					// let the icon inherit the button color
					style={{ width: "1.1em", height: "1.1em" }}
				/>
			</MagneticClickWrapper>
		</IconButton>
	);
};
