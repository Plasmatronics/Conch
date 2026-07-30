import { type Media, mediaTableName } from "./Media";
import { type Users, usersTableName } from "./Users";

export const conchesTableName = "conches" as const;

export interface Conches {
	conch_id: number;
	conch_name: string;
	media_id: Media["media_id"];
	confirmations_needed_for_referrals: number;
	admin_id: Users["user_id"];
	created_at: Date;
	deleted_date?: Date;
}

export const conchesDependencyEdges: Array<[string, string]> = [
	[conchesTableName, mediaTableName],
	[conchesTableName, usersTableName],
];

export const createConchesTableQuery = `
CREATE TABLE ${conchesTableName} (
    conch_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	media_id integer NOT NULL REFERENCES ${mediaTableName},
	confirmations_needed_for_referrals smallint NOT NULL,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamp
);`;
