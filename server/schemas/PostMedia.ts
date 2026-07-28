import type { Members, Media } from "./index";

export interface PostMedia {
	id: number;
	createdAt: Date;
	member: Members["id"];
	media: Media["id"];
	deletedDate?: Date;
}

export const createPostMediaTableQuery = `
CREATE TABLE post_media (
	post_media_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	member_id integer NOT NULL REFERENCES members,
	media_id integer NOT NULL REFERENCES media,
    deleted_date timestamp
);`;
