import { defineLayerStyles } from "@chakra-ui/react";

export const layerStyles = defineLayerStyles({
	interactionButton: {
		description: "styling for interaction buttons",
		value: {
			bg: "transparent",
			color: "gray.500",
			_hover: {
				bg: "gray.100",
			},
		},
	},
});
