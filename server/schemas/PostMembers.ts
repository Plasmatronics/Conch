import type { Members, Posts } from "./index";

export interface PostMember {
	id: number;
	createdAt: Date;
	member: Members["id"];
	post: Posts["id"];
	deletedDate?: Date;
}

export const createPostMembersTableQuery = `
CREATE TABLE post_members (
	post_member_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	member_id integer NOT NULL REFERENCES members,
	post_id integer NOT NULL REFERENCES posts,
    deleted_date timestamp
);`;
