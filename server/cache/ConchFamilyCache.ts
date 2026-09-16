import { Pool } from "pg";
import {
	AllFamilyRelations,
	ConchFamilyGraphFactory,
	ConchFamilyGraphInput,
	ConchFamilyGraphInputSchema,
} from "../domain";
import {
	conchesIdColumnName,
	membersIdColumnName,
	membersTableName,
	relationshipsTableName,
} from "../schemas";
import { LRUCacheWithDelete } from "mnemonist";

export class ConchFamilyCache {
	private inFlightMap: Record<number, Promise<AllFamilyRelations>> = {};

	constructor(
		private dbPool: Pool,
		private conchFamilyGraphFactory: ConchFamilyGraphFactory,
		private lruCache: LRUCacheWithDelete<number, AllFamilyRelations>,
	) {}

	private buildCacheForConchId({
		relationships,
		memberIds,
	}: ConchFamilyGraphInput): AllFamilyRelations {
		const conchFamilyGraph =
			this.conchFamilyGraphFactory.createConchFamilyGraph();
		conchFamilyGraph.buildRelationshipMap({
			memberIds,
			relationships,
		});

		const cacheForCurConch: AllFamilyRelations = {};
		for (const memberId of memberIds)
			cacheForCurConch[memberId] = conchFamilyGraph.getRelationships(memberId);

		return cacheForCurConch;
	}

	private async retrieveRelationshipsAndMembers(
		conchId: number,
	): Promise<AllFamilyRelations> {
		try {
			const query = `
				WITH conch_members AS (
      				SELECT ${membersIdColumnName}
      				FROM ${membersTableName}
      				WHERE ${conchesIdColumnName} = $1
  				)
  				SELECT(
          			SELECT json_agg(r)
          			FROM ${relationshipsTableName} r
          			JOIN conch_members cm
              			ON cm.member_id = r.source_member_id
      			) AS relationships,
      			(SELECT array_agg(${membersIdColumnName})
          		FROM conch_members
      			) AS "memberIds";`;

			const dbRes = await this.dbPool.query(query, [conchId]);

			const row = dbRes.rows[0];
			const graphInput = ConchFamilyGraphInputSchema.parse({
				relationships: row?.relationships ?? [],
				memberIds: row?.memberIds ?? [],
			});

			return this.buildCacheForConchId(graphInput);
		} catch (err: unknown) {
			throw new Error(
				`Error retrieving relationships and members from conchId ${conchId}: ${err instanceof Error ? err.message : "An unknown error has occurred"}`,
			);
		}
	}

	private async buildCacheEntry(conchId: number): Promise<AllFamilyRelations> {
		if (conchId in this.inFlightMap) return await this.inFlightMap[conchId];

		const buildPromise = this.retrieveRelationshipsAndMembers(conchId);

		this.inFlightMap[conchId] = buildPromise;

		try {
			const relations = await buildPromise;

			if (this.inFlightMap[conchId] === buildPromise)
				this.lruCache.set(conchId, relations);

			return relations;
		} catch (error) {
			const cache = this.lruCache.peek(conchId);

			if (cache && this.inFlightMap[conchId] === buildPromise)
				this.lruCache.delete(conchId);

			throw error;
		} finally {
			if (this.inFlightMap[conchId] === buildPromise) {
				delete this.inFlightMap[conchId];
			}
		}
	}

	async getConchRelationships(conchId: number): Promise<AllFamilyRelations> {
		try {
			if (conchId in this.inFlightMap) return await this.inFlightMap[conchId];
			if (this.lruCache.peek(conchId)) return this.lruCache.get(conchId)!;

			return await this.buildCacheEntry(conchId);
		} catch (err: unknown) {
			throw new Error(
				`There was an error getting relationships for Conch ${conchId}: ${err instanceof Error ? err.message : "An unknown error has occurred."}`,
			);
		}
	}

	async rebuildCacheEntry(conchId: number): Promise<AllFamilyRelations> {
		try {
			return await this.buildCacheEntry(conchId);
		} catch (err: unknown) {
			throw new Error(
				`There was an error rebuilding the cache entry Conch ${conchId}: ${err instanceof Error ? err.message : "An unknown error has occurred."}`,
			);
		}
	}
}
