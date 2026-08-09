import { z } from "zod";
import { apiDateSchema } from "./shared";
import { usersTableName } from "./Users";

export const sessionsTableName = "sessions" as const;
export const sessionsIdColumnName = "session_id" as const;

export const sessionsSchema = z.object({
	[sessionsIdColumnName]: z.number(),
	session_token_hash: z.string(),
	user_id: z.number(),
	expire_time: apiDateSchema,
	absolute_expire_time: apiDateSchema,
});

export const sessionsCreateSchema = sessionsSchema.omit({
	[sessionsIdColumnName]: true,
});

export const sessionsUpdateSchema = sessionsSchema.pick({
	expire_time: true,
});

export type Sessions = z.infer<typeof sessionsSchema>;

export const sessionsDependencyEdges: Array<[string, string]> = [
	[sessionsTableName, usersTableName],
];

export const createSessionsTableQuery = `
CREATE TABLE ${sessionsTableName} (
	${sessionsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	session_token_hash text NOT NULL UNIQUE,
	user_id integer NOT NULL REFERENCES ${usersTableName} ON DELETE CASCADE,
	expire_time timestamptz NOT NULL,
	absolute_expire_time timestamptz NOT NULL
);`;
