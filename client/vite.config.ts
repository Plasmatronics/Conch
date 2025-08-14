/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
import path from "node:path";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			// point to package *sources*
			"@conch/design-system": path.resolve(
				__dirname,
				"../packages/design-system/src/theme.ts",
			),
			"@conch/shared": path.resolve(__dirname, "../shared/src/index.ts"),
		},
	},
});
