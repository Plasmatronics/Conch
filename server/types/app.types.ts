import { HealthCheck } from "./index";

export interface ConchService {
	health: () => Promise<HealthCheck>;
}

export interface ConchServerEnvConfig {
	devPort: string;
	secretId: string;
	accessKeyId: string;
	secretAccessKey: string;
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
	caCertPath: string;
	apiPrefix: string;
	jwtSecret: string;
}
