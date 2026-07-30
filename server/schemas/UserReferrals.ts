import { type Users, usersTableName } from "./Users";
import { type Conches, conchesTableName } from "./Conches";
import { type Members, membersTableName } from "./Members";

export const userReferralsTableName = "user_referrals" as const;

export interface UserReferrals {
	user_referral_id: number;
	created_at: Date;
	referred_phone_number: string;
	referred_email?: string;
	referred_member_id: Members["member_id"];
	referrer_id: Users["user_id"];
	conch_id: Conches["conch_id"];
	count: number;
	deleted_date?: Date;
}

export const userReferralsDependencyEdges: Array<[string, string]> = [
	[userReferralsTableName, membersTableName],
	[userReferralsTableName, usersTableName],
	[userReferralsTableName, conchesTableName],
];

export const createUserReferralsQuery = `
CREATE TABLE ${userReferralsTableName} (
	user_referral_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_phone_number text NOT NULL,
	referred_email text,
	referred_member_id integer NOT NULL REFERENCES ${membersTableName},
	referrer_id integer NOT NULL REFERENCES ${usersTableName},
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	count smallint NOT NULL DEFAULT 1,
    deleted_date timestamp
);`;
