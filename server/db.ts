import fs from "fs";
import { Client } from "pg";
import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export const testDb = async (): Promise<void> => {
	const {
		SECRETS_MANAGER_SECRET_ID: secretId,
		SECRETS_MANAGER_ACCESS_KEY_ID: accessKeyId,
		SECRETS_MANAGER_SECRET_ACCESS_KEY: secretAccessKey,
		DATABASE: db,
		RDS_HOST_ENDPOINT: host,
		RDS_PORT: rdsPortStr,
		AWS_REGION: region,
	} = process.env;
	const rdsPort = Number(rdsPortStr);

	if (!region) throw new Error("Missing AWS_REGION");
	if (!secretId) throw new Error("Missing SECRETS_MANAGER_SECRET_ID");
	if (!secretId) throw new Error("Missing SECRETS_MANAGER_SECRET_ID");
	if (!accessKeyId) throw new Error("Missing SECRETS_MANAGER_ACCESS_KEY_ID");
	if (!secretAccessKey)
		throw new Error("Missing SECRETS_MANAGER_SECRET_ACCESS_KEY");
	if (!db) throw new Error("Missing DATABASE");
	if (!host) throw new Error("Missing RDS_HOST_ENDPOINT");
	if (!rdsPort || Number.isNaN(rdsPort))
		throw new Error(`Invalid RDS_PORT: ${rdsPort}`);

	const secretsClient = new SecretsManagerClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
	const command = new GetSecretValueCommand({ SecretId: secretId });
	const response = await secretsClient.send(command);
	const secretString = JSON.parse(response.SecretString as string);

	if (!secretString.username) throw new Error("Unable to load secret username");
	if (!secretString.password) throw new Error("Unable to load secret password");

	const pgClient = new Client({
		host,
		port: rdsPort,
		database: db,
		user: secretString.username,
		password: secretString.password,
		ssl: {
			rejectUnauthorized: true,
			ca: fs.readFileSync("./us-east-2-bundle.pem", "utf8"),
		},
	});

	try {
		await pgClient.connect();
		const res = await pgClient.query("SELECT version()");
		console.log(
			`succesfully connected to RDS-managed PostgreSQL db via version ${res.rows[0].version}`,
		);
	} catch (error) {
		console.error("Database error:", error);
		throw error;
	} finally {
		await pgClient.end();
		console.log("succesfully closed connection to db");
	}
};
