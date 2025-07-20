import express from "express";
import morgan from "morgan";

const app = express();

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

export default app;
