import {
	SecretsManagerClient,
	GetSecretValueCommand,
	DescribeSecretCommand,
} from "@aws-sdk/client-secrets-manager";
import { ConchService, HealthCheck } from "../../types";

interface SecretUsernameAndPassword {
	username: string;
	password: string;
}

interface SecretStoreConfig {
	secretId: string;
}

export interface SecretStoreStrategy extends ConchService {
	getSecretUsernameAndPassword(): Promise<SecretUsernameAndPassword>;
}

export class AWSSecretStore implements SecretStoreStrategy {
	private serviceName = "AWS Secret Store";

	constructor(
		private secretsManager: SecretsManagerClient,
		private config: SecretStoreConfig,
	) {}

	async health(): Promise<HealthCheck> {
		const checkStartTime = Date.now();
		try {
			const command = new DescribeSecretCommand({
				SecretId: this.config.secretId,
			});
			await this.secretsManager.send(command);

			return {
				service: this.serviceName,
				isHealthy: true,
				requestTime: Date.now() - checkStartTime,
				message: "All components operable",
			};
		} catch (err: unknown) {
			return {
				service: this.serviceName,
				isHealthy: false,
				requestTime: Date.now() - checkStartTime,
				message:
					err instanceof Error
						? err.message
						: "Check failed for unknown reasons",
			};
		}
	}

	async getSecretUsernameAndPassword(): Promise<SecretUsernameAndPassword> {
		const command = new GetSecretValueCommand({
			SecretId: this.config.secretId,
		});
		const response = await this.secretsManager.send(command);
		const secretString = JSON.parse(response.SecretString as string);

		if (!secretString.username)
			throw new Error("Unable to load secret username");
		if (!secretString.password)
			throw new Error("Unable to load secret password");

		return { username: secretString.username, password: secretString.password };
	}
}
