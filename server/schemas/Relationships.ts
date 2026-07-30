import { Members, membersTableName } from "./Members";

export const relationshipsTableName = "relationships" as const;

export type Relationship = "spouse" | "child" | "pet" | "friend";

export interface Relationships {
	relationship_id: number;
	relationship_type: Relationship;
	created_at: Date;
	source_member_id: Members["member_id"];
	target_member_id: Members["member_id"];
	deleted_date?: Date;
}

export const relationshipsDependencyEdges: Array<[string, string]> = [
	[relationshipsTableName, membersTableName],
];

export const createRelationshipTypeEnumQuery = `
CREATE TYPE relationship AS ENUM ('spouse', 'child', 'friend', 'pet');
`;
export const createRelationshipsTableQuery = `
CREATE TABLE ${relationshipsTableName} (
	relationship_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	relationship_type relationship NOT NULL,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	source_member_id integer NOT NULL REFERENCES ${membersTableName},
	target_member_id integer NOT NULL REFERENCES ${membersTableName},
    deleted_date timestamp
);`;
