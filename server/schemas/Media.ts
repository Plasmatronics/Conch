export const mediaTableName = "media" as const;

export interface Media {
	media_id: number;
	storage_key: string;
	created_at: Date;
	deleted_date?: Date;
}

export const mediaDependencyEdges: Array<[string, string]> = [];

export const createMediaTableQuery = `
CREATE TABLE ${mediaTableName} (
	media_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	storage_key text NOT NULL,
    deleted_date timestamp
);`;
