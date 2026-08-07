import { z } from "zod";
import { membersTableName } from "./Members";
import { usersTableName } from "./Users";
import { conchesTableName } from "./Conches";
import { apiDateSchema } from "./shared";

export const claimsTableName = "claims" as const;
export const claimsIdColumnName = "claim_id" as const;

export const claimsSchema = z.object({
	[claimsIdColumnName]: z.number(),
	created_at: apiDateSchema,
	conch_id: z.number(),
	user_id: z.number(),
	member_id: z.number(),
	deleted_date: apiDateSchema.optional(),
});

export const claimsCreateSchema = claimsSchema.omit({
	[claimsIdColumnName]: true,
	created_at: true,
});

export const claimsUpdateSchema = claimsCreateSchema.partial();
export type Claims = z.infer<typeof claimsSchema>;

export const claimsDependencyEdges: Array<[string, string]> = [
	[claimsTableName, membersTableName],
	[claimsTableName, usersTableName],
	[claimsTableName, conchesTableName],
];

export const createClaimsTableQuery = `
CREATE TABLE ${claimsTableName} (
    claim_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestampz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	user_id integer NOT NULL REFERENCES ${usersTableName},
	member_id integer NOT NULL REFERENCES ${membersTableName},
	deleted_date timestampz
);`;
