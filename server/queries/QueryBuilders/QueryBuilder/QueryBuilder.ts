import { BuildQuery } from "./QueryBuilder.types";

export abstract class QueryBuilder {
	constructor(
		protected tableName: string,
		protected conchId: string | number | null = null,
	) {}

	abstract build(): BuildQuery;
}
