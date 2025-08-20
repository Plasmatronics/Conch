import { BaseButtonProps } from "components/Buttons/BaseButton.types";
import React from "react";

export interface LikeButtonProps extends BaseButtonProps {
	isLiked: boolean;
	setIsLiked: React.Dispatch<React.SetStateAction<boolean>>;
	onToggle?: (nextValue: boolean) => void;
}
