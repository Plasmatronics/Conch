import type { Point } from "geojson";
import { type Conches, conchesTableName } from "./Conches";
import { type Media, mediaTableName } from "./Media";

export const membersTableName = "members" as const;

export interface Members {
	member_id: number;
	created_at: Date;
	first_name: string;
	last_name: string;
	conch_id: Conches["conch_id"];
	photo_id?: Media["media_id"];
	date_of_birth?: Date;
	biography?: string;
	date_of_death?: Date;
	addresses?: Point[];
	birth_location?: Point;
	death_location?: Point;
	burial_location?: Point;
	deleted_date?: Date;
}

export const membersDependencyEdges: Array<[string, string]> = [
	[membersTableName, conchesTableName],
	[membersTableName, mediaTableName],
];

export const createMembersTableQuery = `
CREATE TABLE ${membersTableName} (
    member_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	first_name text NOT NULL,
	last_name text NOT NULL,
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	photo_id integer REFERENCES ${mediaTableName},
	date_of_birth timestamp,
	biography text,
	date_of_death timestamp,
	addresses point[],
	birth_location point,
	death_location point,
	burial_location point,
	deleted_date timestamp
);`;
