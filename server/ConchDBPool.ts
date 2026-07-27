import fs from "fs";
import { Pool } from "pg";
import type { SecretStoreStrategy } from "./index";

interface DBPoolClient {
	disconnect: () => Promise<void>;
	connect: () => Promise<void>;
}

class PgDbPoolClientAdapter implements DBPoolClient {
	constructor(private readonly client: Pool) {}

	async connect(): Promise<void> {
		await this.client.connect();
	}

	async disconnect(): Promise<void> {
		await this.client.end();
	}
}

interface ConchPostGreSQLDBConfig {
	db: string;
	host: string;
	rdsPortStr: string;
	region: string;
}

export class ConchDBPool {
	pool: DBPoolClient | null = null;

	constructor(
		public config: ConchPostGreSQLDBConfig,
		private secretStore: SecretStoreStrategy,
	) {}

	async initializePool(): Promise<void> {
		if (this.pool) return;

		const { username, password } =
			await this.secretStore.getSecretUsernameAndPassword();
		const pool = new Pool({
			host: this.config.host,
			port: Number(this.config.rdsPortStr),
			database: this.config.db,
			user: username,
			password: password,
			ssl: {
				rejectUnauthorized: true,
				ca: fs.readFileSync("./us-east-2-bundle.pem", "utf8"),
			},
		});

		this.pool = new PgDbPoolClientAdapter(pool);
	}

	async borrowClientFromPool(): Promise<void> {
		await this.initializePool();
		if (!this.pool)
			throw new Error(
				"must initialize pool client before a client can be borrowed",
			);

		await this.pool.connect();
		console.log(
			`successfully borrowed client from the db pool on port ${this.config.rdsPortStr}`,
		);
	}

	async releaseClientsAndClosePool(): Promise<void> {
		if (!this.pool) return;

		await this.pool.disconnect();
		console.log("successfully disconnected from the db pool");
	}
}
