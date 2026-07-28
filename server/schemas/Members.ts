import type { Point } from "geojson";
import type { Conches, Media } from "./index";

export interface Members {
	id: number;
	createdAt: Date;
	firstName: string;
	lastName: string;
	conch: Conches["id"];
	primaryPhoto?: Media["id"];
	DOB?: Date;
	biography?: string;
	DOD?: Date;
	addresses?: Point[];
	birthLocation?: Point;
	deathLocation?: Point;
	burialLocation?: Point;
	deletedDate?: Date;
}

export const createMembersTableQuery = `
CREATE TABLE members (
    member_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	first_name text NOT NULL,
	last_name text NOT NULL,
	conch_id integer NOT NULL REFERENCES conches,
	photo_id integer REFERENCES media,
	date_of_birth timestamp,
	biography text,
	date_of_death timestamp,
	addresses point[],
	birth_location point,
	death_location point,
	burial_location point,
	deleted_date timestamp
);`;
