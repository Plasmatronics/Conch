import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import { testDb } from "./index";

dotenv.config({ path: "../config.env" });

const devPort = Number(process.env.DEV_PORT);
if (!devPort || Number.isNaN(devPort))
	throw new Error(`Invalid DEV_PORT: ${devPort}`);

const app: Express = express();

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "ok" });
});

app.listen(devPort, async () => {
	await testDb();
	console.log(`Listening on port ${devPort}`);
});
