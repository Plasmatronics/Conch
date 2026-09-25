export type ConditionOperator = "=" | "!=" | ">" | ">=" | "<" | "<=" | "LIKE";

export type BuildQuery = {
	query: string;
	values: unknown[];
};

export interface KeyValuePair {
	key: string;
	value: unknown;
}

export interface Condition extends KeyValuePair {
	operator: ConditionOperator;
}
