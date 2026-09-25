import z from "zod";
import { MAX_QUERY_PARAM_RESULT_LIMIT } from "../../config";

export const SortDirectionSchema = z.enum(["ASC", "DESC"]);
export const LimitSchema = z.coerce
	.number()
	.min(1)
	.max(MAX_QUERY_PARAM_RESULT_LIMIT);
export const LastSeenIdSchema = z.coerce.number();
