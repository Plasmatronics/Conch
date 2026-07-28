import { Point } from "geojson";
import type { Users } from "./index";

export type Season = "winter" | "spring" | "summer" | "fall";

export interface StoryDate {
	season?: Season;
	year: number;
}

export interface Posts {
	id: number;
	author: Users["id"];
	title: string;
	createdAt: Date;
	bodyText?: string;
	location?: Point;
	date?: StoryDate;
	deletedDate?: Date;
}

export const createSeasonEnum = `CREATE TYPE season AS ENUM ('winter', 'spring', 'summer', 'fall');`;

export const createPostsTableQuery = `
CREATE TABLE posts (
	post_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	author_id integer NOT NULL REFERENCES users,
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
