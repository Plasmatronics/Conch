import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { layerStyles, textStyles } from "./theme/patterns";

const config = defineConfig({
	globalCss: {
		":root": {
			// scrollbarGutter: "stable both-edges",
		},
	},
	theme: {
		layerStyles,
		textStyles,
	},
});

export const system = createSystem(defaultConfig, config);
