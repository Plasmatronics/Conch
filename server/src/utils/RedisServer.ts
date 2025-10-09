import { createClient, RedisClientType } from "redis";

export class RedisServer {
	private static instance: RedisServer;
	private client: RedisClientType;

	private constructor() {
		const connectionUrl = `rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`;

		this.client = createClient({
			url: connectionUrl,
		});
	}

	public static async getRedisInstance(): Promise<RedisServer> {
		if (!RedisServer.instance) {
			const server = new RedisServer();
			await server.client.connect();

			RedisServer.instance = server;
		}

		return RedisServer.instance;
	}

	public static async getClient(): Promise<RedisClientType> {
		const instance = await RedisServer.getRedisInstance();

		return instance.client;
	}
}
