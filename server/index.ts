import express from "express";
import morgan from "morgan";
import {
	documentRouter,
	familyTreeMemberRouter,
	likeRouter,
	mediaRouter,
	storyRouter,
	userRouter,
} from "./src/routes";
import { AppError } from "./src/utils";
import { globalErrorHandler } from "./src/controllers";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

//initializing routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/familyTreeMembers", familyTreeMemberRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/stories", storyRouter);

//if app reaches this route it must be a 404 error
app.use((req, _, next) => {
	next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
