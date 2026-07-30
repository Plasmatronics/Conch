import { type Members, membersTableName } from "./Members";
import { type Posts, postsTableName } from "./Posts";

export const postMembersTableName = "post_members" as const;

export interface PostMember {
	post_member_id: number;
	created_at: Date;
	member_id: Members["member_id"];
	post_id: Posts["post_id"];
	deleted_date?: Date;
}

export const postMembersDependencyEdges: Array<[string, string]> = [
	[postMembersTableName, membersTableName],
	[postMembersTableName, postsTableName],
];

export const createPostMembersTableQuery = `
CREATE TABLE ${postMembersTableName} (
	post_member_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	member_id integer NOT NULL REFERENCES ${membersTableName},
	post_id integer NOT NULL REFERENCES ${postsTableName},
    deleted_date timestamp
);`;
