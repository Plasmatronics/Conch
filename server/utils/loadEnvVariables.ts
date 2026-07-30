import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

interface ConchServerConfig {
	devPort: string;
	secretId: string;
	accessKeyId: string;
	secretAccessKey: string;
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
	caCertPath: string;
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
	path: path.resolve(currentDirectory, "../../config.env"),
});

export const loadEnvVariables = (): ConchServerConfig => {
	const {
		DEV_PORT: devPort,
		SECRETS_MANAGER_SECRET_ID: secretId,
		SECRETS_MANAGER_ACCESS_KEY_ID: accessKeyId,
		SECRETS_MANAGER_SECRET_ACCESS_KEY: secretAccessKey,
		DATABASE: db,
		RDS_HOST_ENDPOINT: host,
		RDS_PORT: rdsPortStr,
		AWS_REGION: region,
		CA_CERT_PATH: caCertPath,
	} = process.env;

	if (!region) throw new Error("Missing AWS_REGION");
	if (!secretId) throw new Error("Missing SECRETS_MANAGER_SECRET_ID");
	if (!accessKeyId) throw new Error("Missing SECRETS_MANAGER_ACCESS_KEY_ID");
	if (!secretAccessKey)
		throw new Error("Missing SECRETS_MANAGER_SECRET_ACCESS_KEY");
	if (!db) throw new Error("Missing DATABASE");
	if (!host) throw new Error("Missing RDS_HOST_ENDPOINT");
	if (!caCertPath) throw new Error("Missing CA_CERT_PATH");
	if (!rdsPortStr || Number.isNaN(Number(rdsPortStr)))
		throw new Error(`Invalid RDS_PORT: ${rdsPortStr}`);
	if (!devPort || Number.isNaN(Number(devPort)))
		throw new Error(`Invalid RDS_PORT: ${devPort}`);

	return {
		devPort,
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
	};
};
