import { z } from "zod";
import {
	apiDateSchema,
	membersTableName,
	relationshipsIdColumnName,
	relationshipsTableName,
} from "./shared";

export type Relationship = "spouse" | "child" | "pet" | "friend";

export const relationshipsSchema = z.object({
	[relationshipsIdColumnName]: z.number(),
	relationship_type: z.enum(["spouse", "child", "pet", "friend"]),
	created_at: apiDateSchema,
	source_member_id: z.number(),
	target_member_id: z.number(),
});

export const relationshipsCreateSchema = relationshipsSchema.omit({
	[relationshipsIdColumnName]: true,
	created_at: true,
});

export const relationshipsUpdateSchema = relationshipsCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Relationships = z.infer<typeof relationshipsSchema>;

export const relationshipsDependencyEdges: Array<[string, string]> = [
	[relationshipsTableName, membersTableName],
];

export const createRelationshipTypeEnumQuery = `
CREATE TYPE relationship AS ENUM ('spouse', 'child', 'friend', 'pet');
`;
export const createRelationshipsTableQuery = `
CREATE TABLE ${relationshipsTableName} (
	${relationshipsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	relationship_type relationship NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	source_member_id integer NOT NULL REFERENCES ${membersTableName},
	target_member_id integer NOT NULL REFERENCES ${membersTableName}
);`;
