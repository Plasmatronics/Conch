import { z } from "zod";
import { conchesTableName } from "./Conches";
import { mediaQuerySchema, mediaTableName } from "./Media";
import { apiDateSchema, conchesIdColumnName } from "./shared";

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
	[conchesIdColumnName]: z.number(),
	photo_id: z.number().nullable(),
	date_of_birth: apiDateSchema.nullable(),
	biography: z.string().nullable(),
	date_of_death: apiDateSchema.nullable(),
	addresses: z.array(pointSchema).nullable(),
	birth_location: pointSchema.nullable(),
	death_location: pointSchema.nullable(),
	burial_location: pointSchema.nullable(),
});

export const memberQuerySchema = membersSchema
	.pick({
		first_name: true,
		last_name: true,
		conch_id: true,
	})
	.extend({
		photo: mediaQuerySchema.nullable(),
	});

export const membersCreateSchema = membersSchema
	.omit({
		[membersIdColumnName]: true,
		created_at: true,
		conch_id: true,
	})
	.extend({
		photo_id: z.number().nullable().optional(),
		date_of_birth: apiDateSchema.nullable().optional(),
		biography: z.string().nullable().optional(),
		date_of_death: apiDateSchema.nullable().optional(),
		addresses: z.array(pointSchema).nullable().optional(),
		birth_location: pointSchema.nullable().optional(),
		death_location: pointSchema.nullable().optional(),
		burial_location: pointSchema.nullable().optional(),
	});

export const membersUpdateSchema = membersCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

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
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	photo_id integer REFERENCES ${mediaTableName},
	date_of_birth timestamptz,
	biography text,
	date_of_death timestamptz,
	addresses point[],
	birth_location point,
	death_location point,
	burial_location point
);`;
