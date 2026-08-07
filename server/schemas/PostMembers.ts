import { z } from "zod";
import { membersTableName } from "./Members";
import { postsTableName } from "./Posts";
import { apiDateSchema } from "./shared";

export const postMembersTableName = "post_members" as const;
export const postMembersIdColumnName = "post_member_id" as const;

export const postMembersSchema = z.object({
	[postMembersIdColumnName]: z.number(),
	created_at: apiDateSchema,
	member_id: z.number(),
	post_id: z.number(),
	deleted_date: apiDateSchema.optional(),
});

export const postMembersCreateSchema = postMembersSchema.omit({
	[postMembersIdColumnName]: true,
	created_at: true,
});

export const postMembersUpdateSchema = postMembersCreateSchema.partial();

export type PostMember = z.infer<typeof postMembersSchema>;

export const postMembersDependencyEdges: Array<[string, string]> = [
	[postMembersTableName, membersTableName],
	[postMembersTableName, postsTableName],
];

export const createPostMembersTableQuery = `
CREATE TABLE ${postMembersTableName} (
	post_member_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestampz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	member_id integer NOT NULL REFERENCES ${membersTableName},
	post_id integer NOT NULL REFERENCES ${postsTableName},
    deleted_date timestampz
);`;
