import type { Media, Users } from "./index";

export interface Conches {
	id: number;
	name: string;
	photo: Media["id"];
	dateCreated: Date;
	confirmationsNeededForReferrals: number;
	admin: Users["id"];
}

export const createConchesTableQuery = `
CREATE TABLE conches (
    conch_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	media_id integer NOT NULL REFERENCES media,
	confirmations_needed_for_referrals smallint NOT NULL,
	admin_id integer NOT NULL REFERENCES users,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamp
);`;
