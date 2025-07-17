import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config([
	// Global ignores
	{
		ignores: [
			"dist/**",
			"node_modules/**",
			"**/node_modules/**",
			"server/node_modules/**",
		],
	},

	// Base config for all TypeScript files
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			prettier,
		],
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"prettier/prettier": "error",
		},
		languageOptions: {
			ecmaVersion: 2020,
		},
	},

	// Client-specific config (React only)
	{
		files: ["client/**/*.{ts,tsx}"],
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			prettier: prettierPlugin,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			"prettier/prettier": "error",
		},
		languageOptions: {
			globals: globals.browser,
		},
	},

	// Server-specific config (Node.js only)
	{
		files: ["server/**/*.ts"],
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": "error",
		},
		languageOptions: {
			globals: globals.node,
		},
	},
]);
