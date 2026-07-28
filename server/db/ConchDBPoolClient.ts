import fs from "fs";
import { Pool, PoolClient } from "pg";
import type { SecretStoreStrategy } from "../index";
import path from "path";

interface ConchPostGreSQLDBConfig {
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
	caCertPath: string;
}

export class ConchDBPoolClient {
	private pool: Pool | null = null;

	constructor(
		public config: ConchPostGreSQLDBConfig,
		private secretStore: SecretStoreStrategy,
	) {}

	private async initializePool(): Promise<void> {
		if (this.pool) return;
		const caCert = fs.readFileSync(
			path.resolve(process.cwd(), this.config.caCertPath),
			"utf8",
		);
		if (!caCert)
			throw new Error(
				"Failed to initialize database pool due to CA certificate error.",
			);

		const { username, password } =
			await this.secretStore.getSecretUsernameAndPassword();
		this.pool = new Pool({
			host: this.config.host,
			port: Number(this.config.rdsPortStr),
			database: this.config.db,
			user: username,
			password: password,
			ssl: {
				rejectUnauthorized: true,
				ca: caCert,
			},
		});
	}

	async getClient(): Promise<PoolClient> {
		try {
			await this.initializePool();

			const client = await this.pool!.connect();
			console.log(
				`successfully borrowed client from the db pool on port ${this.config.rdsPortStr}`,
			);
			return client;
		} catch (err: unknown) {
			throw new Error(
				`An error has occurred during client retrieval: ${err instanceof Error ? err.message : "An unknown error has occurred"}`,
			);
		}
	}

	releaseClient(client: PoolClient): void {
		client.release();
	}

	async releaseClientsAndClosePool(): Promise<void> {
		if (!this.pool) return;

		try {
			await this.pool.end();
			this.pool = null;
			console.log("successfully disconnected from the db pool");
		} catch (err: unknown) {
			throw new Error(
				`An error has occurred during pool closure: ${err instanceof Error ? err.message : "An unknown error has occurred"}`,
			);
		}
	}
}
