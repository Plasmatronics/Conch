import { defineSlotRecipe } from "@chakra-ui/react";

export const dialogRecipe = defineSlotRecipe({
	className: "dialog",
	slots: ["root", "backdrop", "positioner", "content", "body"],
	base: {
		body: {},
	},
	variants: {
		size: {
			gallery: {
				content: {
					aspectRatio: "16 / 9",
					w: "min(90vw, 1200px)",
					maxH: "85vh",
					h: "auto",
				},
			},
			tall: {
				content: {
					my: "auto",
					w: "80vw",
					h: "90vh",
					maxW: "650px",
				},
			},
		},
	},
});
