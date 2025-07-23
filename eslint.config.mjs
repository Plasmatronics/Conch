import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config({
	ignores: ["**/build/**", "**/dist/**", "**/node_modules/**"],
	files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
	extends: [
		eslint.configs.recommended,
		tseslint.configs.recommended,
		eslintConfigPrettier,
	],
	rules: {
		"no-console": "warn",
		"@typescript-eslint/no-unused-vars": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
	},
});
