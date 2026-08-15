import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
	{
		ignores: ["**/dist/**", "**/build/**", "**/coverage/**"],
	},

	tseslint.configs.recommended,

	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		plugins: {
			js,
		},
		extends: ["js/recommended"],
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},

	{
		files: ["client/**/*.{js,jsx,ts,tsx}"],

		...pluginReact.configs.flat.recommended,

		languageOptions: {
			...pluginReact.configs.flat.recommended.languageOptions,
			globals: {
				...globals.browser,
			},
		},

		settings: {
			react: {
				version: "detect",
			},
		},
	},

	{
		files: ["client/**/*.{jsx,tsx}"],
		...pluginReact.configs.flat["jsx-runtime"],
	},

	{
		files: ["server/**/*.{js,ts,mjs,cjs,mts,cts}"],

		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},

	eslintConfigPrettier,

	{
		files: ["**/*.test.ts", "**/*.test.tsx"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
]);
