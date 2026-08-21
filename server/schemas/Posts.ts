import { z } from "zod";
import { usersTableName } from "./Users";
import { apiDateSchema } from "./shared";
import { postMembersSchema } from "./PostMembers";
import { postMediaSchema } from "./PostMedia";
import { mediaQuerySchema } from "./Media";
import { memberQuerySchema } from "./Members";
import { conchesTableName } from "./Conches";

export const postsTableName = "posts" as const;
export const postsIdColumnName = "post_id" as const;

export type Season = "winter" | "spring" | "summer" | "fall";

export const storyDateSchema = z.object({
	season: z.enum(["winter", "spring", "summer", "fall"]).nullable(),
	year: z.number(),
});

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
	conch_id: z.number(),
});

export const postQuerySchema = postsSchema.extend({
	members: z.array(memberQuerySchema).default([]),
	media: z.array(mediaQuerySchema).default([]),
});

export const postsCreateSchema = postsSchema
	.omit({
		[postsIdColumnName]: true,
		created_at: true,
		author_id: true,
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
		media: z.array(mediaQuerySchema).default([]),
	});

export const postsUpdateSchema = postsCreateSchema.partial();

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
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	title text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	body_text text,
	location point,
	year integer,
	season season,
	CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
	CHECK (year IS NOT NULL OR season IS NULL)
);`;
