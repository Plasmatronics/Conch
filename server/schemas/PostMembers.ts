import { z } from "zod";
import {
	membersTableName,
	postMembersIdColumnName,
	postMembersTableName,
} from "./shared";
import { postsTableName } from "./shared";
import {
	apiDateSchema,
	membersIdColumnName,
	postsIdColumnName,
} from "./shared";

export const postMembersSchema = z.object({
	[postMembersIdColumnName]: z.number(),
	created_at: apiDateSchema,
	[membersIdColumnName]: z.number(),
	[postsIdColumnName]: z.number(),
});

export const postMembersCreateSchema = postMembersSchema.omit({
	[postMembersIdColumnName]: true,
	created_at: true,
});

export const postMembersUpdateSchema = postMembersCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type PostMember = z.infer<typeof postMembersSchema>;

export const postMembersDependencyEdges: Array<[string, string]> = [
	[postMembersTableName, membersTableName],
	[postMembersTableName, postsTableName],
];

export const createPostMembersTableQuery = `
CREATE TABLE ${postMembersTableName} (
	${postMembersIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	${membersIdColumnName} integer NOT NULL REFERENCES ${membersTableName},
	${postsIdColumnName} integer NOT NULL REFERENCES ${postsTableName}
);`;
