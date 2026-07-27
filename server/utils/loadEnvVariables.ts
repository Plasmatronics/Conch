interface ConchServerConfig {
	devPort: string;
	secretId: string;
	accessKeyId: string;
	secretAccessKey: string;
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
}

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
	} = process.env;

	if (!region) throw new Error("Missing AWS_REGION");
	if (!secretId) throw new Error("Missing SECRETS_MANAGER_SECRET_ID");
	if (!accessKeyId) throw new Error("Missing SECRETS_MANAGER_ACCESS_KEY_ID");
	if (!secretAccessKey)
		throw new Error("Missing SECRETS_MANAGER_SECRET_ACCESS_KEY");
	if (!db) throw new Error("Missing DATABASE");
	if (!host) throw new Error("Missing RDS_HOST_ENDPOINT");
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
	};
};
