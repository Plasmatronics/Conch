import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { loadEnvVariables } from "../utils";
import { ConchDBService } from "./ConchDBService";
import { AWSSecretStore } from "../secrets";
import { PoolConfig } from "pg";

export const createConchDBService = (config?: PoolConfig): ConchDBService => {
	const {
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
	} = loadEnvVariables();

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
			...config,
		},
		secretStore,
	);
};
