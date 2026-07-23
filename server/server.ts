import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

const app: Express = express();
const port = Number(process.env.PORT) || 3000;

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
