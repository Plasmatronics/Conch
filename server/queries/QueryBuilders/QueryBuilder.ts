export type UpdateDeleteOperator =
	"=" | "!=" | ">" | ">=" | "<" | "<=" | "LIKE";

export type BuildQuery = {
	query: string;
	values: unknown[];
};

export interface KeyValuePair {
	key: string;
	value: unknown;
}

export interface Condition extends KeyValuePair {
	operator: UpdateDeleteOperator;
}

export abstract class QueryBuilder {
	constructor(
		protected tableName: string,
		protected conchId: string | number | null = null,
	) {}

	abstract build(): BuildQuery;
}
