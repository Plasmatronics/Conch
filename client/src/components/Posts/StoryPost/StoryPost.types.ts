import { BasePostProps } from "../BasePost";

export interface StoryPostProps
	extends Omit<
		BasePostProps,
		"headerRight" | "children" | "isLiked" | "setIsLiked"
	> {
	content: string;
	onLocationClick: () => void;
	isLiked: BasePostProps["isLiked"];
	setIsLiked: BasePostProps["setIsLiked"];
}
