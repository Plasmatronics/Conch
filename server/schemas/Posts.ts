import { z } from "zod";
import {
	apiDateSchema,
	conchesIdColumnName,
	conchesTableName,
	postsIdColumnName,
	postsTableName,
	usersTableName,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { memberPostQuerySchema } from "./Members";
import { mediaCreateSchema, mediaQuerySchema } from "./Media";
import { postMembersSchema } from "./PostMembers";
import { QueryParamConfig } from "../types";
import { idSchema } from "./utils";

export enum Season {
	winter,
	spring,
	summer,
	fall,
}
export const seasonSchema = z
	.enum(["winter", "spring", "summer", "fall"])
	.nullable();

export const storyDateSchema = z.object({
	season: seasonSchema,
	year: z.number(),
});

const stringToStoryDateParser = (
	input: string,
): z.infer<typeof storyDateSchema> => {
	const [querySeason, queryYear] = input.split("-");
	const season = seasonSchema.parse(querySeason);
	const year = z.coerce.number().parse(queryYear);

	return { season, year };
};

const stringToStoryDateSchema = z.string().transform(stringToStoryDateParser);

export type StoryDate = z.infer<typeof storyDateSchema>;

export const postsSchema = z.object({
	[postsIdColumnName]: z.number(),
	author_id: z.number(),
	title: z.string(),
	created_at: apiDateSchema,
	body_text: z.string().nullable(),
	location: z
		.object({
			type: z.literal("Point"),
			coordinates: z.tuple([z.number(), z.number()]),
		})
		.nullable(),
	date: storyDateSchema.nullable(),
	[conchesIdColumnName]: z.number(),
});

export const postQuerySchema = postsSchema.extend({
	members: z.array(memberPostQuerySchema).default([]),
	media: z.array(mediaQuerySchema).default([]),
});

export const postsCreateSchema = postsSchema
	.omit({
		[postsIdColumnName]: true,
		created_at: true,
		author_id: true,
		[conchesIdColumnName]: true,
	})
	.extend({
		body_text: z.string().nullable().optional(),
		location: z
			.object({
				type: z.literal("Point"),
				coordinates: z.tuple([z.number(), z.number()]),
			})
			.nullable()
			.optional(),
		date: storyDateSchema.nullable().optional(),
		members: z.array(postMembersSchema.shape.member_id).default([]),
		media: z.array(mediaCreateSchema).default([]),
	});

export const postsUpdateSchema = postsSchema
	.omit({
		[postsIdColumnName]: true,
		created_at: true,
		author_id: true,
		[conchesIdColumnName]: true,
	})
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Posts = z.infer<typeof postsSchema>;

export const postsDependencyEdges: Array<[string, string]> = [
	[postsTableName, usersTableName],
	[postsTableName, conchesTableName],
];

export const createSeasonEnum = `CREATE TYPE season AS ENUM ('winter', 'spring', 'summer', 'fall');`;

export const createPostsTableQuery = `
CREATE TABLE ${postsTableName} (
	${postsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	author_id integer NOT NULL REFERENCES ${usersTableName},
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	title text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	body_text text,
	location point,
	year integer,
	season season,
	CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
	CHECK (year IS NOT NULL OR season IS NULL)
);`;

const fields: QueryParamConfig["fields"] = [
	{
		param: postsIdColumnName,
		schema: postQuerySchema.shape[postsIdColumnName],
	},
	{ param: "author_id", schema: postQuerySchema.shape.author_id },
	{ param: "title", schema: postQuerySchema.shape.title },
	{ param: "created_at", schema: postQuerySchema.shape.created_at },
	{ param: "body_text", schema: postQuerySchema.shape.body_text },
	{ param: "location", schema: postQuerySchema.shape.location },
	{ param: "date", schema: postQuerySchema.shape.date },
	{ param: "members", schema: postQuerySchema.shape.members },
	{ param: "media", schema: postQuerySchema.shape.media },
];
const sortFields: QueryParamConfig["sortFields"] = [
	{
		param: "created_at",
		schema: apiDateSchema,
	},
	{
		param: "title",
		schema: postsSchema.shape.title,
	},
	{
		param: "date",
		schema: stringToStoryDateSchema,
	},
	{
		param: "author_id",
		schema: idSchema,
	},
	{
		param: postsIdColumnName,
		schema: idSchema,
	},
];
export const postsQueryParamConfig: QueryParamConfig = {
	fields: fields,
	sortFields,
	filters: [
		...createdAtFilters,
		{
			columnRef: "author_id",
			operator: "=",
			param: "author_id",
			schema: idSchema,
		},
		{
			columnRef: "members",
			operator: "=",
			param: "included_member",
			schema: idSchema,
		},
		{
			columnRef: "date",
			operator: "<=",
			param: "max_date",
			schema: stringToStoryDateSchema,
		},
		{
			columnRef: "date",
			operator: ">=",
			param: "min_date",
			schema: stringToStoryDateSchema,
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: [
		{
			param: "created_at",
			schema: apiDateSchema,
		},
		{
			param: postsIdColumnName,
			schema: idSchema,
		},
	],
	defaultLimit: 50,
	defaultFields: fields,
};
