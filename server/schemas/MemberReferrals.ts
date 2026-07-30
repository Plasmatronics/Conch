import { type Members, membersTableName } from "./Members";
import { type Users, usersTableName } from "./Users";
import { type Conches, conchesTableName } from "./Conches";

export const memberReferralsTableName = "member_referrals" as const;

export interface MemberReferrals {
	member_referral_id: number;
	created_at: Date;
	referred_first_name: string;
	referred_last_name: string;
	referrer_id: Users["user_id"];
	conch_id: Conches["conch_id"];
	parent_one_id?: Members["member_id"];
	parent_two_id?: Members["member_id"];
	child_id?: Members["member_id"];
	spouse_id?: Members["member_id"];
	count: number;
	deleted_date?: Date;
}

export const memberReferralsDependencyEdges: Array<[string, string]> = [
	[memberReferralsTableName, usersTableName],
	[memberReferralsTableName, conchesTableName],
	[memberReferralsTableName, membersTableName],
];

export const createMemberReferralsQuery = `
CREATE TABLE ${memberReferralsTableName} (
	member_referral_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_first_name text NOT NULL,
	referred_last_name text NOT NULL,
	referrer_id integer NOT NULL REFERENCES ${usersTableName},
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	parent_one_id integer REFERENCES ${membersTableName},
	parent_two_id integer REFERENCES ${membersTableName},
	child_id integer REFERENCES ${membersTableName},
	spouse_id integer REFERENCES ${membersTableName},
	count smallint NOT NULL DEFAULT 1,
    deleted_date timestamp
);`;
