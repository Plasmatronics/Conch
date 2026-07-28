import { Members } from "./index";

export type Relationship = "spouse" | "child" | "pet" | "friend";

export interface Relationships {
	id: number;
	type: Relationship;
	createdAt: Date;
	sourceMemberId: Members["id"];
	targetMemberId: Members["id"];
	deletedDate?: Date;
}

export const createRelationshipTypeEnumQuery = `
CREATE TYPE relationship AS ENUM ('spouse', 'child', 'friend', 'pet');
`;
export const createRelationshipsTableQuery = `
CREATE TABLE relationships (
	relationship_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	source_member_id integer NOT NULL REFERENCES members,
	target_member_id integer NOT NULL REFERENCES members,
    deleted_date timestamp
);`;
