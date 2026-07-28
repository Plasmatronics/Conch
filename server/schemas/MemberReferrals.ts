import type { Members, Users, Conches } from "./index";

export interface MemberReferrals {
	id: number;
	referrer: Users["id"];
	conch: Conches["id"];
	referredfirstName: string;
	referredLastName: string;
	parentOne?: Members["id"];
	parentTwo?: Members["id"];
	child?: Members["id"];
	spouse?: Members["id"];
	createdAt: Date;
	deletedDate?: Date;
	count: number;
}

export const createMemberReferralsQuery = `
CREATE TABLE member_referrals (
	member_referral_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_first_name text NOT NULL,
	referred_last_name text NOT NULL,
	referrer_id integer NOT NULL REFERENCES users,
	conch_id integer NOT NULL REFERENCES conches,
	parent_one_id integer REFERENCES members,
	parent_two_id integer REFERENCES members,
	child_id integer REFERENCES members,
	spouse_id integer REFERENCES members,
	count smallint NOT NULL DEFAULT 1,
    deleted_date timestamp
);`;
