import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { ConchDBService } from "./ConchDBService";
import { AWSSecretStore } from "../secrets";
import { PoolConfig } from "pg";
import { ConchServerEnvConfig } from "../types";

interface ConchDBServiceCreationConfig
	extends
		Pick<
			ConchServerEnvConfig,
			| "secretId"
			| "accessKeyId"
			| "secretAccessKey"
			| "db"
			| "host"
			| "rdsPortStr"
			| "region"
			| "caCertPath"
		>,
		Omit<PoolConfig, "host"> {}

export const createConchDBService = (
	config: ConchDBServiceCreationConfig,
): ConchDBService => {
	const {
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
		...poolConfig
	} = config;

	const secretsClient = new SecretsManagerClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});

	const secretStore = new AWSSecretStore(secretsClient, { secretId });

	return new ConchDBService(
		{
			db,
			host,
			rdsPortStr,
			caCertPath,
			...poolConfig,
		},
		secretStore,
	);
};
