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

const app = express();

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//initializing routes
app.use("/api/users", userRouter);
app.use("/api/familyTreeMembers", familyTreeMemberRouter);
app.use("/api/likes", likeRouter);
app.use("/api/media", mediaRouter);
app.use("/api/documents", documentRouter);
app.use("/api/stories", storyRouter);

//if app reaches this route it must be a 404 error
app.all("*", (req, _, next) => {
	next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

export default app;
