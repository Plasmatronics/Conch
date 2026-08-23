import { z } from "zod";
import { apiDateSchema } from "./shared";

export const usersTableName = "users" as const;
export const usersIdColumnName = "user_id" as const;

export const createAppRoleEnumQuery = `
CREATE TYPE app_role AS ENUM ('standard', 'admin');
`;

export type AppRole = "standard" | "admin";

export const usersSchema = z.object({
	[usersIdColumnName]: z.number(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.email(),
	phone_number: z.string(),
	password_hash: z.string(),
	created_at: apiDateSchema,
	app_role: z.enum(["standard", "admin"]),
});

const passwordSchema = z.string().min(8);

export const usersSignupSchema = usersSchema
	.omit({
		[usersIdColumnName]: true,
		created_at: true,
		app_role: true,
		password_hash: true,
	})
	.extend({
		password: passwordSchema,
	});

export const usersLoginSchema = usersSchema
	.pick({
		email: true,
	})
	.extend({
		password: passwordSchema,
	});

export const usersCreateSchema = usersSchema.omit({
	[usersIdColumnName]: true,
	created_at: true,
	app_role: true,
});

export const usersUpdateSchema = usersSignupSchema
	.omit({ password: true })
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Users = z.infer<typeof usersSchema>;

export const authenticatedUsersSchema = usersSchema
	.pick({
		[usersIdColumnName]: true,
		app_role: true,
	})
	.extend({
		serverIds: z.array(z.number()),
	});

export type AuthenticatedUser = z.infer<typeof authenticatedUsersSchema>;

export const usersDependencyEdges: Array<[string, string]> = [];

export const createUsersTableQuery = `
CREATE TABLE ${usersTableName} (
	${usersIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name text NOT NULL,
	last_name text NOT NULL,
	email text NOT NULL UNIQUE,
	phone_number text NOT NULL,
	password_hash text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	app_role app_role NOT NULL DEFAULT 'standard',
);`;
