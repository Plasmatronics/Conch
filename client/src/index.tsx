import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);

if (!root) throw new Error("Root element not found");

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
