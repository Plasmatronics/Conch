import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

if (!root) throw new Error("Root element not found");

const queryClient = new QueryClient();

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ChakraProvider value={defaultSystem}>
				<App />
			</ChakraProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
