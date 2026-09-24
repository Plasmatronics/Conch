import { QueryParamConfig } from "../../types";
import { apiDateSchema } from "./apiDateSchema";

export const createdAtFilters: QueryParamConfig["filters"] = [
	{
		columnRef: "created_at",
		operator: "<=",
		param: "max_created_at",
		parseFn: (value: string) => apiDateSchema.parse(value),
	},
	{
		columnRef: "created_at",
		operator: ">=",
		param: "min_created_at",
		parseFn: (value: string) => apiDateSchema.parse(value),
	},
	{
		columnRef: "created_at",
		operator: "=",
		param: "created_at",
		parseFn: (value: string) => apiDateSchema.parse(value),
	},
];
