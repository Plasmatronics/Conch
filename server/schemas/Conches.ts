import { z } from "zod";
import { mediaTableName } from "./Media";
import { usersTableName } from "./Users";
import { apiDateSchema } from "./shared";

export const conchesTableName = "conches" as const;
export const conchesIdColumnName = "conch_id" as const;

export const conchesSchema = z.object({
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	media_id: z.number(),
	confirmations_needed_for_referrals: z.number(),
	admin_id: z.number(),
	created_at: apiDateSchema,
	deleted_date: apiDateSchema.optional(),
});

export const conchesCreateSchema = conchesSchema.omit({
	[conchesIdColumnName]: true,
	created_at: true,
});

export const conchesUpdateSchema = conchesCreateSchema.partial();

export type Conches = z.infer<typeof conchesSchema>;

export const conchesDependencyEdges: Array<[string, string]> = [
	[conchesTableName, mediaTableName],
	[conchesTableName, usersTableName],
];

export const createConchesTableQuery = `
CREATE TABLE ${conchesTableName} (
    ${conchesIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	media_id integer NOT NULL REFERENCES ${mediaTableName},
	confirmations_needed_for_referrals smallint NOT NULL,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestampz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestampz
);`;
