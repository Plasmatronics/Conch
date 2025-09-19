import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { conchLayerStyles, conchTextStyles } from "./theme/patterns";
import { dialogRecipe } from "./theme/recipes";

const config = defineConfig({
	globalCss: {
		":root": {
			// scrollbarGutter: "stable both-edges",
		},
	},
	theme: {
		slotRecipes: {
			dialog: dialogRecipe,
		},
		layerStyles: conchLayerStyles,
		textStyles: conchTextStyles,
	},
});

export const system = createSystem(defaultConfig, config);
