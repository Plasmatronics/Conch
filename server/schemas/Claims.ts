import type { Members, Users, Conches } from "./index";

export interface Claims {
	id: number;
	dateCreated: Date;
	member: Members["id"];
	users: Users["id"];
	conch: Conches["id"];
}

export const createClaimsTableQuery = `
CREATE TABLE claims (
    claim_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	conch_id integer NOT NULL REFERENCES conches,
	user_id integer NOT NULL REFERENCES users,
	member_id integer NOT NULL REFERENCES members,
	deleted_date timestamp
);`;
