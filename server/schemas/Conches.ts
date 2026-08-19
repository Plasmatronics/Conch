import { z } from "zod";
import { mediaTableName } from "./Media";
import { usersTableName } from "./Users";
import { apiDateSchema } from "./shared";

export const conchesTableName = "conches" as const;
export const conchesIdColumnName = "conch_id" as const;

export const conchesSchema = z.object({
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	media_id: z.number().nullable(),
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
		media_id: z.number().nullable().optional(),
	});

export const conchesUpdateSchema = conchesSchema
	.omit({
		[conchesIdColumnName]: true,
		created_at: true,
		admin_id: true,
	})
	.partial();

export type Conches = z.infer<typeof conchesSchema>;

export const conchesDependencyEdges: Array<[string, string]> = [
	[conchesTableName, mediaTableName],
	[conchesTableName, usersTableName],
];

export const createConchesTableQuery = `
CREATE TABLE ${conchesTableName} (
    ${conchesIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	media_id integer REFERENCES ${mediaTableName},
	confirmations_needed_for_referrals smallint NOT NULL DEFAULT 2,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
);`;
