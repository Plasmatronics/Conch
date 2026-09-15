import { LRUCacheWithDelete } from "mnemonist";
import { Pool } from "pg";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AllFamilyRelations, ConchFamilyGraphFactory } from "../domain";
import { ConchFamilyCache } from "./ConchFamilyCache";

const createDeferredPromise = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
};

const singleMemberQueryResult = (memberId: number) => ({
	rows: [
		{
			relationships: [],
			memberIds: [memberId],
		},
	],
});

const singleMemberRelations = (memberId: number): AllFamilyRelations => ({
	[memberId]: { [memberId]: "Self" },
});

describe("ConchFamilyCache", () => {
	let query: ReturnType<typeof vi.fn>;
	let lruCache: LRUCacheWithDelete<number, AllFamilyRelations>;
	let cache: ConchFamilyCache;

	const createCache = (capacity = 3) => {
		lruCache = new LRUCacheWithDelete<number, AllFamilyRelations>(capacity);
		cache = new ConchFamilyCache(
			{ query } as unknown as Pool,
			new ConchFamilyGraphFactory(),
			lruCache,
		);
	};

	beforeEach(() => {
		query = vi.fn();
		createCache();
	});

	test("returns cached relationships without rebuilding or requerying", async () => {
		query.mockResolvedValue(singleMemberQueryResult(1));

		const firstResult = await cache.getConchRelationships(1);
		const secondResult = await cache.getConchRelationships(1);

		expect(firstResult).toEqual(singleMemberRelations(1));
		expect(secondResult).toBe(firstResult);
		expect(query).toHaveBeenCalledOnce();
	});

	test("concurrent build requests share one database query", async () => {
		const deferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		query.mockReturnValue(deferred.promise);

		const firstRequest = cache.getConchRelationships(1);
		const secondRequest = cache.getConchRelationships(1);

		expect(query).toHaveBeenCalledOnce();

		deferred.resolve(singleMemberQueryResult(1));
		const [firstResult, secondResult] = await Promise.all([
			firstRequest,
			secondRequest,
		]);

		expect(firstResult).toEqual(singleMemberRelations(1));
		expect(secondResult).toBe(firstResult);
		expect(query).toHaveBeenCalledOnce();
	});

	test("concurrent rebuild requests share one database query", async () => {
		query.mockResolvedValueOnce(singleMemberQueryResult(1));
		await cache.getConchRelationships(1);

		const deferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		query.mockReturnValue(deferred.promise);

		const firstRebuild = cache.rebuildCacheEntry(1);
		const secondRebuild = cache.rebuildCacheEntry(1);

		expect(query).toHaveBeenCalledTimes(2);

		deferred.resolve(singleMemberQueryResult(2));
		const [firstResult, secondResult] = await Promise.all([
			firstRebuild,
			secondRebuild,
		]);

		expect(firstResult).toEqual(singleMemberRelations(2));
		expect(secondResult).toBe(firstResult);
		expect(query).toHaveBeenCalledTimes(2);
	});

	test("reads wait for an in-flight rebuild instead of returning stale data", async () => {
		query.mockResolvedValueOnce(singleMemberQueryResult(1));
		await cache.getConchRelationships(1);

		const deferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		query
			.mockReturnValueOnce(deferred.promise)
			.mockResolvedValue(singleMemberQueryResult(2));

		const rebuild = cache.rebuildCacheEntry(1);
		const readDuringRebuild = cache.getConchRelationships(1);

		expect(query).toHaveBeenCalledTimes(2);

		deferred.resolve(singleMemberQueryResult(2));
		const [rebuiltRelations, readRelations] = await Promise.all([
			rebuild,
			readDuringRebuild,
		]);

		expect(rebuiltRelations).toEqual(singleMemberRelations(2));
		expect(readRelations).toBe(rebuiltRelations);
		expect(query).toHaveBeenCalledTimes(2);
	});

	test("a successful rebuild replaces the previously cached value", async () => {
		query
			.mockResolvedValueOnce(singleMemberQueryResult(1))
			.mockResolvedValueOnce(singleMemberQueryResult(2));

		await cache.getConchRelationships(1);
		const rebuiltRelations = await cache.rebuildCacheEntry(1);
		const cachedRelations = await cache.getConchRelationships(1);

		expect(rebuiltRelations).toEqual(singleMemberRelations(2));
		expect(cachedRelations).toBe(rebuiltRelations);

		expect(query).toHaveBeenCalledTimes(2);
	});

	test("rebuilds a conch that does not already exist in the cache", async () => {
		query.mockResolvedValue(singleMemberQueryResult(1));

		const rebuiltRelations = await cache.rebuildCacheEntry(1);

		expect(rebuiltRelations).toEqual(singleMemberRelations(1));
		expect(query).toHaveBeenCalledOnce();
		expect(lruCache.peek(1)).toBe(rebuiltRelations);
	});

	test.each([
		["a missing row", { rows: [] }],
		["null aggregates", { rows: [{ relationships: null, memberIds: null }] }],
	])("returns an empty graph for %s", async (_label, queryResult) => {
		query.mockResolvedValue(queryResult);

		await expect(cache.getConchRelationships(1)).resolves.toEqual({});
		expect(query).toHaveBeenCalledOnce();
	});

	test("removes a rejected in-flight build and caches a successful retry", async () => {
		const deferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		query
			.mockReturnValueOnce(deferred.promise)
			.mockResolvedValueOnce(singleMemberQueryResult(1));

		const firstRequest = cache.getConchRelationships(1);
		const secondRequest = cache.getConchRelationships(1);

		expect(query).toHaveBeenCalledOnce();
		deferred.reject(new Error("database unavailable"));

		await Promise.all([
			expect(firstRequest).rejects.toThrow("database unavailable"),
			expect(secondRequest).rejects.toThrow("database unavailable"),
		]);

		const retryResult = await cache.getConchRelationships(1);
		expect(retryResult).toEqual(singleMemberRelations(1));
		expect(query).toHaveBeenCalledTimes(2);
		const cachedRetryResult = await cache.getConchRelationships(1);
		expect(cachedRetryResult).toBe(retryResult);
		expect(query).toHaveBeenCalledTimes(2);
	});

	test("does not cache malformed database results", async () => {
		query.mockResolvedValue({
			rows: [{ relationships: [{ relationship_id: 1 }], memberIds: [1] }],
		});

		await expect(cache.getConchRelationships(1)).rejects.toThrow();
		await expect(cache.getConchRelationships(1)).rejects.toThrow();

		expect(query).toHaveBeenCalledTimes(2);
		expect(lruCache.has(1)).toBe(false);
	});

	test("builds different conches independently", async () => {
		query.mockImplementation((_sql: string, values: unknown[]) =>
			Promise.resolve(singleMemberQueryResult(values[0] as number)),
		);

		const [firstConch, secondConch] = await Promise.all([
			cache.getConchRelationships(1),
			cache.getConchRelationships(2),
		]);

		expect(firstConch).toEqual(singleMemberRelations(1));
		expect(secondConch).toEqual(singleMemberRelations(2));
		expect(query).toHaveBeenCalledTimes(2);
		expect(query.mock.calls.map(([, values]) => values)).toEqual([[1], [2]]);
	});

	test("holds no more completed entries than the LRU capacity", async () => {
		createCache(2);
		query.mockImplementation((_sql: string, values: unknown[]) =>
			Promise.resolve(singleMemberQueryResult(values[0] as number)),
		);

		await cache.getConchRelationships(1);
		await cache.getConchRelationships(2);
		await cache.getConchRelationships(3);

		expect(lruCache.size).toBe(2);
		expect(lruCache.has(1)).toBe(false);
		expect(lruCache.has(2)).toBe(true);
		expect(lruCache.has(3)).toBe(true);
	});

	test("cache hits promote entries before least-recently-used eviction", async () => {
		createCache(2);
		query.mockImplementation((_sql: string, values: unknown[]) =>
			Promise.resolve(singleMemberQueryResult(values[0] as number)),
		);

		await cache.getConchRelationships(1);
		await cache.getConchRelationships(2);
		await cache.getConchRelationships(1);
		await cache.getConchRelationships(3);

		expect(query).toHaveBeenCalledTimes(3);
		expect(lruCache.has(1)).toBe(true);
		expect(lruCache.has(2)).toBe(false);
		expect(lruCache.has(3)).toBe(true);
	});

	test("in-flight builds remain deduplicated when the completed cache is at capacity", async () => {
		createCache(1);
		const firstDeferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		const secondDeferred =
			createDeferredPromise<ReturnType<typeof singleMemberQueryResult>>();
		query.mockImplementation((_sql: string, values: unknown[]) =>
			values[0] === 1 ? firstDeferred.promise : secondDeferred.promise,
		);

		const firstConchRequest = cache.getConchRelationships(1);
		const secondConchRequest = cache.getConchRelationships(2);
		const duplicateFirstConchRequest = cache.getConchRelationships(1);

		expect(query).toHaveBeenCalledTimes(2);

		firstDeferred.resolve(singleMemberQueryResult(1));
		secondDeferred.resolve(singleMemberQueryResult(2));
		const [firstResult, secondResult, duplicateResult] = await Promise.all([
			firstConchRequest,
			secondConchRequest,
			duplicateFirstConchRequest,
		]);

		expect(firstResult).toEqual(singleMemberRelations(1));
		expect(secondResult).toEqual(singleMemberRelations(2));
		expect(duplicateResult).toBe(firstResult);
		expect(query).toHaveBeenCalledTimes(2);
	});

	test("a failed rebuild removes the previously cached value", async () => {
		query
			.mockResolvedValueOnce(singleMemberQueryResult(1))
			.mockRejectedValueOnce(new Error("rebuild failed"))
			.mockResolvedValueOnce(singleMemberQueryResult(2));

		await cache.getConchRelationships(1);
		await expect(cache.rebuildCacheEntry(1)).rejects.toThrow("rebuild failed");

		expect(lruCache.has(1)).toBe(false);
		await expect(cache.getConchRelationships(1)).resolves.toEqual(
			singleMemberRelations(2),
		);
		expect(query).toHaveBeenCalledTimes(3);
	});
});
