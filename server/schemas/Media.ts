import { z } from "zod";

export const mediaTableName = "media" as const;
export const mediaIdColumnName = "media_id" as const;

export const mediaSchema = z.object({
	[mediaIdColumnName]: z.number(),
	storage_key: z.string(),
	created_at: z.date(),
	deleted_date: z.date().optional(),
});

export const mediaCreateSchema = mediaSchema.omit({
	[mediaIdColumnName]: true,
	created_at: true,
});

export const mediaUpdateSchema = mediaCreateSchema.partial();

export type Media = z.infer<typeof mediaSchema>;

export const mediaDependencyEdges: Array<[string, string]> = [];

export const createMediaTableQuery = `
CREATE TABLE ${mediaTableName} (
	media_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	storage_key text NOT NULL,
    deleted_date timestamp
);`;
