import { Users, Conches, Members } from "./index";

export interface UserReferrals {
	id: number;
	referrer: Users["id"];
	conch: Conches["id"];
	referredMember: Members["id"];
	referredPhoneNumber: string;
	referredEmail?: string;
	createdAt: Date;
	deletedDate?: Date;
	count: number;
}

export const createUserReferralsQuery = `
CREATE TABLE user_referrals (
	user_referral_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_phone_number text NOT NULL,
	referred_email text,
	referrer_id integer NOT NULL REFERENCES users,
	conch_id integer NOT NULL REFERENCES conches,
	count smallint NOT NULL DEFAULT 1,
    deleted_date timestamp
);`;
