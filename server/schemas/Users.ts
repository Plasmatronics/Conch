export interface Users {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: string;
	passwordHash: string;
	createdAt: Date;
	deletedDate?: Date;
}

export const createUsersTableQuery = `
CREATE TABLE users (
	user_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	first_name text NOT NULL,
	last_name text NOT NULL,
	email text NOT NULL,
	phone_number text NOT NULL,
	password_hash text NOT NULL,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_date timestamp
);`;
