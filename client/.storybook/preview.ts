import type { Preview } from "@storybook/react";
import withChakra from "./chakraDecorator";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "./handlers";

if (typeof (globalThis as any).mswServer === "undefined") {
	(globalThis as any).mswServer = initialize({
		onUnhandledRequest(req, print) {
			const ignoreKeywordArr = [
				"@fs",
				"src",
				"chrome-extension",
				"node_modules",
			];
			if (ignoreKeywordArr.some((k) => req.url.includes(k))) return;
			print.warning();
		},
	});
}

export const decorators = [withChakra];
export const loaders = [mswLoader];
export const parameters = { msw: { handlers } };

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		msw: { handlers },

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo",
		},
		tags: ["autodocs"],
	},
};

export default preview;
