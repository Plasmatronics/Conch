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
	commentRouter,
	relationsRouter,
} from "./src/routes";
import { AppError } from "./src/utils";
import { globalErrorHandler, sanitizeController } from "./src/controllers";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";

const app = express();

//Add CSPs
let origin;
if (process.env.NODE_ENV === "production") {
	origin = process.env.CLIENT_URL;
} else {
	origin = process.env.HOST + ":" + process.env.PORT;
}

const localDevURLs = ["http://localhost:6006", "http://127.0.0.1:6006"];
const allowedOrigins: string[] = [
	"'self'",
	origin!,
	`https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`,
	...localDevURLs,
].filter(Boolean);

const connectSrcs: string[] = [
	"'self'",
	`https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`,
].filter(Boolean);

const imgSrcs: string[] = [
	"'self'",
	`https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`,
].filter(Boolean);

const frameSrcs: string[] = [
	"'self'",
	origin!,
	`https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`,
].filter(Boolean);

const scriptSrcs: string[] = ["'self'", origin!];

app.use(helmet());
const directives = helmet.contentSecurityPolicy.getDefaultDirectives();
directives["default-src"] = allowedOrigins;
directives["connect-src"] = connectSrcs;
directives["img-src"] = imgSrcs;
directives["frame-src"] = frameSrcs;
directives["script-src"] = scriptSrcs;
app.use(
	helmet.contentSecurityPolicy({
		directives,
	}),
);

//Only allow CORS for our client
const corsOrigins: string[] =
	process.env.NODE_ENV === "production"
		? ([process.env.CLIENT_URL].filter(Boolean) as string[])
		: ([
				process.env.HOST && process.env.PORT
					? `${process.env.HOST}:${process.env.PORT}`
					: origin,
				...localDevURLs,
			].filter(Boolean) as string[]);
app.use(
	cors({
		origin: corsOrigins,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"X-XSRF-TOKEN",
		],
	}),
);

//Compresses text
app.use(compression());

//Rate limiter @250 api req/hour
const limiter = rateLimit({
	max: 250,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

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

//Parameter pollution
app.use(hpp());

//Parsing cookies and serving static images
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));

//Sanitize input for routes
app.use(sanitizeController.sanitizeInput);

//initializing routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/familyTreeMembers", familyTreeMemberRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/documents", documentRouter);
app.use("/api/v1/stories", storyRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/files", fileRouter);
app.use("/api/v1/relations", relationsRouter);

//If app reaches this route it must be a 404 error
app.use((req, _, next) => {
	next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
