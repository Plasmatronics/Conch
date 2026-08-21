import { z } from "zod";
import { mediaTableName } from "./Media";
import { apiDateSchema } from "./shared";
import { postsTableName } from "./Posts";

export const postMediaTableName = "post_media" as const;
export const postMediaIdColumnName = "post_media_id" as const;

export const postMediaSchema = z.object({
	[postMediaIdColumnName]: z.number(),
	created_at: apiDateSchema,
	post_id: z.number(),
	media_id: z.number(),
});

export const postMediaCreateSchema = postMediaSchema.omit({
	[postMediaIdColumnName]: true,
	created_at: true,
});

export const postMediaUpdateSchema = postMediaCreateSchema.partial();

export type PostMedia = z.infer<typeof postMediaSchema>;

export const postMediaDependencyEdges: Array<[string, string]> = [
	[postMediaTableName, postsTableName],
	[postMediaTableName, mediaTableName],
];

export const createPostMediaTableQuery = `
CREATE TABLE ${postMediaTableName} (
	${postMediaIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	post_id integer NOT NULL REFERENCES ${postsTableName},
	media_id integer NOT NULL REFERENCES ${mediaTableName},
);`;
