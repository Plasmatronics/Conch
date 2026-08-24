import { z } from "zod";
import { apiDateSchema } from "./shared";
import { conchesTableName } from "./Conches";

export const mediaTableName = "media" as const;
export const mediaIdColumnName = "media_id" as const;

export type mediaType = "image" | "video" | "audio" | "document";
export const mediaTypeEnum = `CREATE TYPE media_type AS ENUM ('winter', 'spring', 'summer', 'fall');`;

export const mediaSchema = z.object({
	[mediaIdColumnName]: z.number(),
	storage_key: z.string(),
	created_at: apiDateSchema,
	conch_id: z.number(),
	mime_type: z.string(),
	media_type: z.enum(["image", "video", "audio", "document"]),
});

export const mediaQuerySchema = mediaSchema.omit({
	[mediaIdColumnName]: true,
	created_at: true,
	conch_id: true,
});

export const mediaUpdateSchema = mediaQuerySchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Media = z.infer<typeof mediaSchema>;

export const mediaDependencyEdges: Array<[string, string]> = [
	[mediaTableName, conchesTableName],
];

export const createMediaTableQuery = `
CREATE TABLE ${mediaTableName} (
	${mediaIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	storage_key text NOT NULL,
	mime_type text NOT NULL,
	media_type media_type NOT NULL
);`;
