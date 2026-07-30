import { type Members, membersTableName } from "./Members";
import { type Users, usersTableName } from "./Users";
import { type Conches, conchesTableName } from "./Conches";

export const claimsTableName = "claims" as const;

export interface Claims {
	claim_id: number;
	created_at: Date;
	conch_id: Conches["conch_id"];
	user_id: Users["user_id"];
	member_id: Members["member_id"];
	deleted_date?: Date;
}

export const claimsDependencyEdges: Array<[string, string]> = [
	[claimsTableName, membersTableName],
	[claimsTableName, usersTableName],
	[claimsTableName, conchesTableName],
];

export const createClaimsTableQuery = `
CREATE TABLE ${claimsTableName} (
    claim_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	user_id integer NOT NULL REFERENCES ${usersTableName},
	member_id integer NOT NULL REFERENCES ${membersTableName},
	deleted_date timestamp
);`;
