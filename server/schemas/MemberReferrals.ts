import { z } from "zod";
import { type Members, membersTableName } from "./Members";
import { type Users, usersTableName } from "./Users";
import { type Conches, conchesTableName } from "./Conches";

export const memberReferralsTableName = "member_referrals" as const;
export const memberReferralsIdColumnName = "member_referral_id" as const;

export const memberReferralsSchema = z.object({
	[memberReferralsIdColumnName]: z.number(),
	created_at: z.date(),
	referred_first_name: z.string(),
	referred_last_name: z.string(),
	referrer_id: z.number(),
	conch_id: z.number(),
	parent_one_id: z.number().optional(),
	parent_two_id: z.number().optional(),
	child_id: z.number().optional(),
	spouse_id: z.number().optional(),
	count: z.number(),
	deleted_date: z.date().optional(),
});

export const memberReferralsCreateSchema = memberReferralsSchema
	.omit({
		[memberReferralsIdColumnName]: true,
		created_at: true,
	})
	.partial({ count: true });

export const memberReferralsUpdateSchema =
	memberReferralsCreateSchema.partial();

export type MemberReferrals = z.infer<typeof memberReferralsSchema>;

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
