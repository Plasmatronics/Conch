import { BasePostProps } from "./BasePost";

export const postDefaults: Partial<BasePostProps> = {
	avatar: "https://images.unsplash.com/photo-1511806754518-53bada35f930",
	user: "Nicholas Bruno",
	relationship: "Brother",
	title:
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas adipisci eveniet distinctio minus et culpa ipsum necessitatibus",
	year: new Date(Date.now()),
};
