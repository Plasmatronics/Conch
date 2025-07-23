import fs from "fs";
import { shutDownServer, startServer } from "../../server";
import { FamilyTreeMember } from "../models";
import { fileURLToPath } from "url";
import path from "path";

const importDevData = async () => {
	try {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const devDataJSON = fs.readFileSync(`${__dirname}/devData.json`, "utf-8");
		const devDataObj = JSON.parse(devDataJSON);

		await startServer();
		const result = await FamilyTreeMember.insertMany(devDataObj);
		console.log(`Inserted ${result.length} family tree members`);
		await shutDownServer();
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
		await startServer();
		const result = await FamilyTreeMember.deleteMany();
		console.log(`Deleted ${result.deletedCount} family tree members`);

		await shutDownServer();
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
