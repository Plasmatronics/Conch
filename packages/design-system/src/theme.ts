import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { layerStyles } from "./theme/patterns";

const config = defineConfig({
	theme: {
		layerStyles,
	},
});

export const system = createSystem(defaultConfig, config);
