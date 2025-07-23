import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./index";

dotenv.config({ path: "./../config.env" });

const dbURI = process.env.DATABASE || "";
const dbPassword = process.env.DATABASE_PASSWORD || "";
const dbUsername = process.env.DATABASE_USERNAME || "";

const db = dbURI
	.replace("<DATABASE_PASSWORD>", dbPassword)
	.replace("<DATABASE_USERNAME>", dbUsername);

const startServer = async () => {
	try {
		const connection = await mongoose.connect(db);

		console.log(`successfully connected with version ${connection.version}`);
	} catch (err: unknown) {
		console.log(err instanceof Error ? err.message : String(err));
	}
};
startServer();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`App running on port ${port}`);
});

const shutDownServer = async () => {
	try {
		await new Promise<void>((resolve, reject) => {
			server.close((err) => {
				if (err) reject(err);
				console.log("server closed");
				resolve();
			});
		});

		await mongoose.disconnect();
		console.log("mongoose disconnected");
		process.exit(0);
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error(err.message);
		} else {
			console.error("Server could not shut down");
		}
		process.exit(1);
	}
};

process.on("SIGINT", shutDownServer);
process.on("SIGTERM", shutDownServer);
