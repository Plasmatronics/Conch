import { BaseButtonProps } from "components/Buttons/BaseButton.types";

export interface FullscreenButtonProps extends BaseButtonProps {
	isExpanded: boolean;
	setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
	onToggle?: (nextValue: boolean) => void;
}
