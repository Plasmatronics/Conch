import { z } from "zod";
import { type Media, mediaTableName } from "./Media";
import { type Users, usersTableName } from "./Users";

export const conchesTableName = "conches" as const;
export const conchesIdColumnName = "conch_id" as const;

export const conchesSchema = z.object({
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	media_id: z.number(),
	confirmations_needed_for_referrals: z.number(),
	admin_id: z.number(),
	created_at: z.date(),
	deleted_date: z.date().optional(),
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
    conch_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	media_id integer NOT NULL REFERENCES ${mediaTableName},
	confirmations_needed_for_referrals smallint NOT NULL,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamp
);`;
