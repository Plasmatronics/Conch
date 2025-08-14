import { defineLayerStyles } from "@chakra-ui/react";

export const layerStyles = defineLayerStyles({
	interactionButton: {
		description: "styling for interaction buttons",
		value: {
			bg: "gray.200",
			color: "blue.900",
			_hover: {
				bg: "gray.100",
			},
		},
	},
});
