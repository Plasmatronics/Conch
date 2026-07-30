export const usersTableName = "users" as const;

export interface Users {
	user_id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	password_hash: string;
	created_at: Date;
	deleted_date?: Date;
}

export const usersDependencyEdges: Array<[string, string]> = [];

export const createUsersTableQuery = `
CREATE TABLE ${usersTableName} (
	user_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name text NOT NULL,
	last_name text NOT NULL,
	email text NOT NULL,
	phone_number text NOT NULL,
	password_hash text NOT NULL,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamp
);`;
