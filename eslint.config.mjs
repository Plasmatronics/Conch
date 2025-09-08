// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default tseslint.config(
	{
		ignores: ["**/build/**", "**/dist/**", "**/node_modules/**"],
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommended,
			eslintConfigPrettier,
			...pluginQuery.configs["flat/recommended"],
		],
		rules: {
			"no-console": "warn",
			"no-await-in-loop": "warn",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	storybook.configs["flat/recommended"],
);
