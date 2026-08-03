import { z } from "zod";
import { type Members, membersTableName } from "./Members";
import { type Media, mediaTableName } from "./Media";

export const postMediaTableName = "post_media" as const;
export const postMediaIdColumnName = "post_media_id" as const;

export const postMediaSchema = z.object({
	[postMediaIdColumnName]: z.number(),
	created_at: z.date(),
	member_id: z.number(),
	media_id: z.number(),
	deleted_date: z.date().optional(),
});

export const postMediaCreateSchema = postMediaSchema.omit({
	[postMediaIdColumnName]: true,
	created_at: true,
});

export const postMediaUpdateSchema = postMediaCreateSchema.partial();

export type PostMedia = z.infer<typeof postMediaSchema>;

export const postMediaDependencyEdges: Array<[string, string]> = [
	[postMediaTableName, membersTableName],
	[postMediaTableName, mediaTableName],
];

export const createPostMediaTableQuery = `
CREATE TABLE ${postMediaTableName} (
	post_media_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	member_id integer NOT NULL REFERENCES ${membersTableName},
	media_id integer NOT NULL REFERENCES ${mediaTableName},
    deleted_date timestamp
);`;
