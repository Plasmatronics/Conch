import { BasePostProps } from "./BasePost";
import { BaseMediaItem } from "./PostGallery/PostGallery.types";

export const postDefaults: Partial<BasePostProps> = {
	avatar: "https://images.unsplash.com/photo-1511806754518-53bada35f930",
	user: "Nicholas Bruno",
	relationship: "Brother",
	title:
		"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas adipisci eveniet distinctio minus et culpa ipsum necessitatibus",
	year: new Date(Date.now()),
};

export const vertVideo: BaseMediaItem = {
	src: "https://www.youtube.com/watch?v=q-Y0bnx6Ndw&list=RDq-Y0bnx6Ndw&start_radio=1",
	type: "Video",
};

export const horizVideo: BaseMediaItem = {
	src: "https://www.youtube.com/watch?v=q-Y0bnx6Ndw&list=RDq-Y0bnx6Ndw&start_radio=1",
	type: "Video",
};

export const vertImage: BaseMediaItem = {
	src: "https://i.pinimg.com/736x/2d/95/e5/2d95e5886fc4c65a6778b5fee94a7d59.jpg",
	type: "Image",
};

export const threeHorizontalImages: Omit<BaseMediaItem, "height" | "width">[] =
	[
		{
			src: "https://images.pexels.com/photos/1054655/pexels-photo-1054655.jpeg?cs=srgb&dl=pexels-hsapir-1054655.jpg&fm=jpg",
			type: "Image",
		},
		{
			src: "https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630",
			type: "Image",
		},
		{
			src: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
			type: "Image",
		},
	];
