import { z } from "zod";
import { conchesTableName } from "./Conches";
import { mediaTableName } from "./Media";
import { apiDateSchema } from "./shared";

export const membersTableName = "members" as const;
export const membersIdColumnName = "member_id" as const;

const pointSchema = z.object({
	type: z.literal("Point"),
	coordinates: z.tuple([z.number(), z.number()]),
});

export const membersSchema = z.object({
	[membersIdColumnName]: z.number(),
	created_at: apiDateSchema,
	first_name: z.string(),
	last_name: z.string(),
	conch_id: z.number(),
	photo_id: z.number().optional(),
	date_of_birth: apiDateSchema.optional(),
	biography: z.string().optional(),
	date_of_death: apiDateSchema.optional(),
	addresses: z.array(pointSchema).optional(),
	birth_location: pointSchema.optional(),
	death_location: pointSchema.optional(),
	burial_location: pointSchema.optional(),
	deleted_date: apiDateSchema.optional(),
});

export const membersCreateSchema = membersSchema.omit({
	[membersIdColumnName]: true,
	created_at: true,
	deleted_date: true,
});

export const membersUpdateSchema = membersCreateSchema.partial();

export type Members = z.infer<typeof membersSchema>;

export const membersDependencyEdges: Array<[string, string]> = [
	[membersTableName, conchesTableName],
	[membersTableName, mediaTableName],
];

export const createMembersTableQuery = `
CREATE TABLE ${membersTableName} (
    ${membersIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	first_name text NOT NULL,
	last_name text NOT NULL,
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	photo_id integer REFERENCES ${mediaTableName},
	date_of_birth timestamptz,
	biography text,
	date_of_death timestamptz,
	addresses point[],
	birth_location point,
	death_location point,
	burial_location point,
	deleted_date timestamptz
);`;
