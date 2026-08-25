import { z } from "zod";
import {
	apiDateSchema,
	mediaIdColumnName,
	mediaTableName,
	conchesTableName,
	conchesIdColumnName,
} from "./shared";

export type mediaType = "image" | "video" | "audio" | "document";
export const mediaTypeEnum = `
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document');
`;
export const mediaSchema = z.object({
	[mediaIdColumnName]: z.number(),
	storage_key: z.string(),
	created_at: apiDateSchema,
	[conchesIdColumnName]: z.number(),
	mime_type: z.string(),
	media_type: z.enum(["image", "video", "audio", "document"]),
	is_conch_photo: z.boolean(),
});

export const mediaQuerySchema = mediaSchema.omit({
	[mediaIdColumnName]: true,
	created_at: true,
	conch_id: true,
});

export const mediaCreateSchema = mediaQuerySchema.omit({
	is_conch_photo: true,
});

export const mediaUpdateSchema = mediaCreateSchema
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
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	storage_key text NOT NULL,
	mime_type text NOT NULL,
	media_type media_type NOT NULL,
	is_conch_photo boolean NOT NULL DEFAULT FALSE
);`;
