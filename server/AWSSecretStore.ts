import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

interface SecretUsernameAndPassword {
	username: string;
	password: string;
}

interface SecretStoreConfig {
	secretId: string;
}

export interface SecretStoreStrategy {
	getSecretUsernameAndPassword(): Promise<SecretUsernameAndPassword>;
}

export class AWSSecretStore implements SecretStoreStrategy {
	constructor(
		private secretsManager: SecretsManagerClient,
		private config: SecretStoreConfig,
	) {}

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
