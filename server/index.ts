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

export default app;
