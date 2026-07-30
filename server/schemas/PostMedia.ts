import { type Members, membersTableName } from "./Members";
import { type Media, mediaTableName } from "./Media";

export const postMediaTableName = "post_media" as const;

export interface PostMedia {
	post_media_id: number;
	created_at: Date;
	member_id: Members["member_id"];
	media_id: Media["media_id"];
	deleted_date?: Date;
}

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
