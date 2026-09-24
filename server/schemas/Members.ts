import { z } from "zod";
import {} from "./Conches";
import {
	apiDateSchema,
	conchesIdColumnName,
	conchesTableName,
	mediaTableName,
	membersIdColumnName,
	membersTableName,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { mediaQuerySchema } from "./Media";
import { QueryParamConfig } from "../types";

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

export const memberPostQuerySchema = membersSchema
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
		photo: mediaQuerySchema.nullable(),
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

export const membersQueryParamConfig: QueryParamConfig = {
	fields: [
		membersIdColumnName,
		"created_at",
		"first_name",
		"last_name",
		"photo",
		"date_of_birth",
		"biography",
		"date_of_death",
		"addresses",
		"birth_location",
		"death_location",
		"burial_location",
	],
	sortFields: [
		"created_at",
		"first_name",
		"last_name",
		"date_of_birth",
		"date_of_death",
		membersIdColumnName,
	],
	filters: [
		...createdAtFilters,
		{
			columnRef: "first_name",
			operator: "=",
			param: "first_name",
			parseFn: (input: string) => z.string().parse(input),
		},
		{
			columnRef: "last_name",
			operator: "=",
			param: "last_name",
			parseFn: (input: string) => z.string().parse(input),
		},
		{
			columnRef: "date_of_birth",
			operator: "<=",
			param: "max_date_of_birth",
			parseFn: (input: string) => apiDateSchema.parse(input),
		},
		{
			columnRef: "date_of_birth",
			operator: ">=",
			param: "min_date_of_birth",
			parseFn: (input: string) => apiDateSchema.parse(input),
		},
		{
			columnRef: "date_of_death",
			operator: "<=",
			param: "max_date_of_death",
			parseFn: (input: string) => apiDateSchema.parse(input),
		},
		{
			columnRef: "date_of_death",
			operator: ">=",
			param: "min_date_of_death",
			parseFn: (input: string) => apiDateSchema.parse(input),
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: ["last_name", membersIdColumnName],
	defaultLimit: 50,
	defaultFields: [
		membersIdColumnName,
		"created_at",
		"first_name",
		"last_name",
		"photo",
	],
};
