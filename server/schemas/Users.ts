import { z } from "zod";
import { apiDateSchema } from "./shared";

export const usersTableName = "users" as const;
export const usersIdColumnName = "user_id" as const;

export const usersSchema = z.object({
	[usersIdColumnName]: z.number(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.email(),
	phone_number: z.string(),
	password_hash: z.string(),
	created_at: apiDateSchema,
	deleted_date: apiDateSchema.optional(),
});

export const usersCreateSchema = usersSchema.omit({
	[usersIdColumnName]: true,
	created_at: true,
});

export const usersUpdateSchema = usersCreateSchema.partial();

export type Users = z.infer<typeof usersSchema>;

export const usersDependencyEdges: Array<[string, string]> = [];

export const createUsersTableQuery = `
CREATE TABLE ${usersTableName} (
	${usersIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name text NOT NULL,
	last_name text NOT NULL,
	email text NOT NULL,
	phone_number text NOT NULL,
	password_hash text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamptz
);`;
