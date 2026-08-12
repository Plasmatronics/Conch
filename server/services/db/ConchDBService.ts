import fs from "fs";
import { Pool, PoolConfig } from "pg";
import type { SecretStoreStrategy } from "../secrets";
import path from "path";
import { HealthCheck, ConchService, type ConchServerEnvConfig } from "../../types";

interface ConchDBServiceConfig
	extends
		Pick<ConchServerEnvConfig, "db" | "host" | "rdsPortStr" | "caCertPath">,
		Omit<PoolConfig, "host"> {}

export class ConchDBService implements ConchService {
	private serviceName: string = "ConchDBPoolClient";
	private pool: Pool | null = null;
	private openPoolPromise: Promise<Pool> | null = null;
	private closePoolPromise: Promise<void> | null = null;

	constructor(
		public config: ConchDBServiceConfig,
		private secretStore: SecretStoreStrategy,
	) {}

	async health(): Promise<HealthCheck> {
		const checkStartTime = Date.now();
		try {
			const pool = await this.initializePool();
			await pool.query(`SELECT 1`);

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

	private async createPool(): Promise<Pool> {
		try {
			const { username, password } =
				await this.secretStore.getSecretUsernameAndPassword();

			const { host, rdsPortStr, db, caCertPath, ...poolConfig } = this.config;
			const caCert = await fs.promises.readFile(
				path.resolve(process.cwd(), caCertPath),
				"utf8",
			);
			if (!caCert)
				throw new Error(
					"Failed to initialize database pool due to CA certificate error.",
				);

			const pool = new Pool({
				...poolConfig,
				host,
				port: Number(rdsPortStr),
				database: db,
				user: username,
				password,
				ssl: {
					rejectUnauthorized: true,
					ca: caCert,
				},
			});
			pool.on("error", (err) => {
				console.error("Unexpected PostgreSQL pool error", err);
			});

			this.pool = pool;
			return this.pool;
		} catch (err: unknown) {
			throw new Error(
				`Error during pool creation: ${err instanceof Error ? err.message : "an unknown error has occurred."}`,
			);
		}
	}

	async initializePool(): Promise<Pool> {
		if (this.closePoolPromise) {
			await this.closePoolPromise;
		}

		if (this.pool) return this.pool;
		if (this.openPoolPromise) return this.openPoolPromise;
		const openPromise = this.createPool();
		this.openPoolPromise = openPromise;

		try {
			return await openPromise;
		} finally {
			if (this.openPoolPromise === openPromise) {
				this.openPoolPromise = null;
			}
		}
	}

	private async closePool(): Promise<void> {
		if (this.openPoolPromise) {
			await this.openPoolPromise;
		}

		const pool = this.pool;
		if (!pool) return;

		try {
			await pool.end();
			console.log("Successfully disconnected from the database pool");
		} catch (err: unknown) {
			throw new Error(
				`An error occurred during pool closure: ${
					err instanceof Error ? err.message : "Unknown error"
				}`,
			);
		} finally {
			if (this.pool === pool) {
				this.pool = null;
			}
		}
	}

	async releaseClientsAndClosePool(): Promise<void> {
		if (this.closePoolPromise) return this.closePoolPromise;
		const closePromise = this.closePool();
		this.closePoolPromise = closePromise;
		try {
			return await closePromise;
		} finally {
			if (this.closePoolPromise === closePromise) this.closePoolPromise = null;
		}
	}
}
