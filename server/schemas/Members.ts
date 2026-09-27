import { z } from "zod";
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
import { idSchema } from "./utils";

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

const sortFields: QueryParamConfig["sortFields"] = [
	{
		param: "created_at",
		schema: apiDateSchema,
	},
	{
		param: "first_name",
		schema: membersSchema.shape.first_name,
	},
	{
		param: "last_name",
		schema: membersSchema.shape.last_name,
	},
	{
		param: "date_of_birth",
		schema: apiDateSchema,
	},
	{
		param: "date_of_death",
		schema: apiDateSchema,
	},
	{
		param: membersIdColumnName,
		schema: idSchema,
	},
];
export const membersQueryParamConfig: QueryParamConfig = {
	fields: [
		{
			param: membersIdColumnName,
			schema: membersSchema.shape[membersIdColumnName],
		},
		{ param: "created_at", schema: membersSchema.shape.created_at },
		{ param: "first_name", schema: membersSchema.shape.first_name },
		{ param: "last_name", schema: membersSchema.shape.last_name },
		{ param: "photo", schema: membersCreateSchema.shape.photo },
		{ param: "date_of_birth", schema: membersSchema.shape.date_of_birth },
		{ param: "biography", schema: membersSchema.shape.biography },
		{ param: "date_of_death", schema: membersSchema.shape.date_of_death },
		{ param: "addresses", schema: membersSchema.shape.addresses },
		{ param: "birth_location", schema: membersSchema.shape.birth_location },
		{ param: "death_location", schema: membersSchema.shape.death_location },
		{ param: "burial_location", schema: membersSchema.shape.burial_location },
	],
	sortFields,
	filters: [
		...createdAtFilters,
		{
			columnRef: "first_name",
			operator: "=",
			param: "first_name",
			schema: z.string(),
		},
		{
			columnRef: "last_name",
			operator: "=",
			param: "last_name",
			schema: z.string(),
		},
		{
			columnRef: "date_of_birth",
			operator: "<=",
			param: "max_date_of_birth",
			schema: apiDateSchema,
		},
		{
			columnRef: "date_of_birth",
			operator: ">=",
			param: "min_date_of_birth",
			schema: apiDateSchema,
		},
		{
			columnRef: "date_of_death",
			operator: "<=",
			param: "max_date_of_death",
			schema: apiDateSchema,
		},
		{
			columnRef: "date_of_death",
			operator: ">=",
			param: "min_date_of_death",
			schema: apiDateSchema,
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: [
		{
			param: "last_name",
			schema: membersSchema.shape.last_name,
		},
		{
			param: membersIdColumnName,
			schema: idSchema,
		},
	],
	defaultLimit: 50,
	defaultFields: [
		{
			param: membersIdColumnName,
			schema: membersSchema.shape[membersIdColumnName],
		},
		{ param: "created_at", schema: membersSchema.shape.created_at },
		{ param: "first_name", schema: membersSchema.shape.first_name },
		{ param: "last_name", schema: membersSchema.shape.last_name },
		{ param: "photo", schema: membersCreateSchema.shape.photo },
	],
};
