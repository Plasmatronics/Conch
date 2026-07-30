import { Point } from "geojson";
import { type Users, usersTableName } from "./Users";

export const postsTableName = "posts" as const;

export type Season = "winter" | "spring" | "summer" | "fall";

export interface StoryDate {
	season?: Season;
	year: number;
}

export interface Posts {
	post_id: number;
	author_id: Users["user_id"];
	title: string;
	created_at: Date;
	body_text?: string;
	location?: Point;
	date?: StoryDate;
	deleted_date?: Date;
}

export const postsDependencyEdges: Array<[string, string]> = [
	[postsTableName, usersTableName],
];

export const createSeasonEnum = `CREATE TYPE season AS ENUM ('winter', 'spring', 'summer', 'fall');`;

export const createPostsTableQuery = `
CREATE TABLE ${postsTableName} (
	post_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	author_id integer NOT NULL REFERENCES ${usersTableName},
	title text NOT NULL,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	body_text text,
	location point,
	year integer,
	season season,
	deleted_date timestamp
	CHECK (year IS NULL OR year BETWEEN 1900 AND 2100),
	CHECK (year IS NOT NULL OR season IS NULL)
);`;
