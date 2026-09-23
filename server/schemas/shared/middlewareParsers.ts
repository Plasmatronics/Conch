import z from "zod";

export const SortDirectionSchema = z.enum(["ASC", "DESC"]);
export const LimitSchema = z.number().min(1).max(100);
export const LastSeenIdSchema = z.coerce.number();
