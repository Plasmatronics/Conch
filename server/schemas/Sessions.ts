import { z } from "zod";
import {
	apiDateSchema,
	sessionsIdColumnName,
	sessionsTableName,
	usersIdColumnName,
	usersTableName,
} from "./shared";

export const sessionsSchema = z.object({
	[sessionsIdColumnName]: z.number(),
	session_token_hash: z.string(),
	[usersIdColumnName]: z.number(),
	expire_time: apiDateSchema,
	absolute_expire_time: apiDateSchema,
});

export const sessionsCreateSchema = sessionsSchema.omit({
	[sessionsIdColumnName]: true,
});

export const sessionsUpdateSchema = sessionsSchema
	.pick({
		expire_time: true,
	})
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Sessions = z.infer<typeof sessionsSchema>;

export const sessionsDependencyEdges: Array<[string, string]> = [
	[sessionsTableName, usersTableName],
];

export const createSessionsTableQuery = `
CREATE TABLE ${sessionsTableName} (
	${sessionsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	session_token_hash text NOT NULL UNIQUE,
	${usersIdColumnName} integer NOT NULL REFERENCES ${usersTableName} ON DELETE CASCADE,
	expire_time timestamptz NOT NULL,
	absolute_expire_time timestamptz NOT NULL
);`;
