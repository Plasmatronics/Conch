export interface Media {
	id: number;
	storageKey: string;
	createdAt: Date;
	deletedDate?: Date;
}

export const createMediaTableQuery = `
CREATE TABLE media (
	media_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	storage_key text NOT NULL,
    deleted_date timestamp
);`;
