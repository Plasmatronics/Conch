import express from "express";
import morgan from "morgan";
import {
	documentRouter,
	familyTreeMemberRouter,
	likeRouter,
	mediaRouter,
	storyRouter,
	userRouter,
	fileRouter,
} from "./src/routes";
import { AppError } from "./src/utils";
import { globalErrorHandler } from "./src/controllers";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";

const app = express();

//Only allow CORS for our client
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

//Compresses text
app.use(compression());

//Rate limiter @250 api req/hour
const limiter = rateLimit({
	max: 250,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

//Adds security headers
app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Adds helpful HTTP logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//Limit req.body to 100kb.
app.use(
	express.json({
		limit: "100kb",
	}),
);

//Prevents injection attacks and XSS attacks
app.use(mongoSanitize());
app.use(xss());

//Parameter pollution
app.use(hpp());

//Parsing cookies and serving static images
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

//initializing routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/familyTreeMembers", familyTreeMemberRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/stories", storyRouter);
app.use("/api/v1/files", fileRouter);

//If app reaches this route it must be a 404 error
app.use((req, _, next) => {
	next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
