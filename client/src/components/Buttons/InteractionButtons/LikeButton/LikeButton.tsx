import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LikeButtonProps } from "./LikeButton.types";
import { useAnimate } from "framer-motion";
import { MagneticClickWrapper } from "../../../AnimationWrappers";
import { TbHeart, TbHeartFilled } from "react-icons/tb";
import { useEffect } from "react";

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
	onClick,
	strokeWidth,
	onToggle,
	...iconButtonProps
}: LikeButtonProps) => {
	const [scope, animate] = useAnimate();

	const HeartIcon = isLiked ? TbHeartFilled : TbHeart;

	useEffect(() => {
		if (isLiked) {
			animate(
				"svg",
				{ scale: [1, 1.22, 1] },
				{ duration: 0.35, ease: "easeOut" },
			);
		}
	}, [animate, isLiked]);

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
			{...(isLiked ? LIKED_STYLES : UNLIKED_STYLES)}
			{...iconButtonProps}
			aria-label={isLiked ? "Unlike Button" : "Like Button"}
			aria-pressed={isLiked}
			className="group"
			onClick={handleClick}
		>
			<MagneticClickWrapper>
				<span ref={scope}>
					<HeartIcon strokeWidth={strokeWidth || "2px"} />
				</span>
			</MagneticClickWrapper>
		</IconButton>
	);
};
