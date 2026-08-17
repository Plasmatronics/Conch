// vitest.config.ts
import { vi } from "vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["**/*.integration.test.ts"],
		setupFiles: ["./vitest.setup.ts"],
		clearMocks: true,
	},
});
