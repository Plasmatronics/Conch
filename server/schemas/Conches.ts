import { z } from "zod";
import {
	conchesIdColumnName,
	conchesTableName,
	usersTableName,
	apiDateSchema,
} from "./shared";

export const conchesSchema = z.object({
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	confirmations_needed_for_referrals: z.number(),
	admin_id: z.number(),
	created_at: apiDateSchema,
});

export const conchesCreateSchema = conchesSchema
	.omit({
		[conchesIdColumnName]: true,
		created_at: true,
		admin_id: true,
	})
	.extend({
		confirmations_needed_for_referrals: z.number().default(2),
	});

export const conchesUpdateSchema = conchesSchema
	.omit({
		[conchesIdColumnName]: true,
		created_at: true,
		admin_id: true,
	})
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Conches = z.infer<typeof conchesSchema>;

export const conchesDependencyEdges: Array<[string, string]> = [
	[conchesTableName, usersTableName],
];

export const createConchesTableQuery = `
CREATE TABLE ${conchesTableName} (
    ${conchesIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	confirmations_needed_for_referrals smallint NOT NULL DEFAULT 2,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;
