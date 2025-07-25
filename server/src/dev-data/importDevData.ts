import fs from "fs";
import { FamilyTreeMember } from "../models";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../../../config.env");
dotenv.config({ path: configPath });

const dbURI = process.env.DATABASE || "";
const dbPassword = process.env.DATABASE_PASSWORD || "";
const dbUsername = process.env.DATABASE_USERNAME || "";

const db = dbURI
	.replace("<DATABASE_USERNAME>", dbUsername)
	.replace("<DATABASE_PASSWORD>", dbPassword);

const importDevData = async () => {
	try {
		const devDataJSON = fs.readFileSync(`${__dirname}/devData.json`, "utf-8");
		const devDataObj = JSON.parse(devDataJSON);

		await mongoose.connect(db);
		const result = await FamilyTreeMember.insertMany(devDataObj);
		console.log(`Inserted ${result.length} family tree members`);
		await mongoose.disconnect();
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
		} else {
			console.error("Could not import dev data");
		}
	}
};

const deleteDevData = async () => {
	try {
		await mongoose.connect(db);
		const result = await FamilyTreeMember.deleteMany();
		console.log(`Deleted ${result.deletedCount} family tree members`);
		await mongoose.disconnect();
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
		} else {
			console.error("Could not delete dev data");
		}
	}
};

if (process.argv[2] === "--import") {
	importDevData();
} else if (process.argv[2] === "--delete") {
	deleteDevData();
}
