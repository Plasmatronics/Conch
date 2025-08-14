import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@conch/design-system";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

if (!root) throw new Error("Root element not found");

root.render(
	<React.StrictMode>
		<ChakraProvider value={system}>
			<App />
		</ChakraProvider>
	</React.StrictMode>,
);
