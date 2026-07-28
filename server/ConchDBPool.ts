import fs from "fs";
import { Pool, PoolClient } from "pg";
import type { SecretStoreStrategy } from "./index";
import path from "path";

interface ConchPostGreSQLDBConfig {
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
	caCertPath: string;
}

interface DbPool {
	connect(): Promise<PoolClient>;
	end(): Promise<void>;
}

export class ConchDBClient {
	pool: DbPool | null = null;

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
		await this.initializePool();
		if (!this.pool)
			throw new Error(
				"must initialize pool client before a client can be borrowed",
			);

		const client = await this.pool.connect();
		console.log(
			`successfully borrowed client from the db pool on port ${this.config.rdsPortStr}`,
		);
		return client;
	}

	releaseClient(client: PoolClient): void {
		client.release();
	}

	async releaseClientsAndClosePool(): Promise<void> {
		if (!this.pool) return;

		await this.pool.end();
		console.log("successfully disconnected from the db pool");
	}
}
