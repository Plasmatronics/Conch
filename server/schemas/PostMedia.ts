import { z } from "zod";
import {
	apiDateSchema,
	postsTableName,
	mediaTableName,
	mediaIdColumnName,
	postsIdColumnName,
	postMediaIdColumnName,
	postMediaTableName,
} from "./shared";

export const postMediaSchema = z.object({
	[postMediaIdColumnName]: z.number(),
	created_at: apiDateSchema,
	[postsIdColumnName]: z.number(),
	[mediaIdColumnName]: z.number(),
});

export const postMediaCreateSchema = postMediaSchema.omit({
	[postMediaIdColumnName]: true,
	created_at: true,
});

export const postMediaUpdateSchema = postMediaCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type PostMedia = z.infer<typeof postMediaSchema>;

export const postMediaDependencyEdges: Array<[string, string]> = [
	[postMediaTableName, postsTableName],
	[postMediaTableName, mediaTableName],
];

export const createPostMediaTableQuery = `
CREATE TABLE ${postMediaTableName} (
	${postMediaIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	${postsIdColumnName} integer NOT NULL REFERENCES ${postsTableName},
	${mediaIdColumnName} integer NOT NULL REFERENCES ${mediaTableName}
);`;
