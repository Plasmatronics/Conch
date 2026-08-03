import { z } from "zod";
import { type Users, usersTableName } from "./Users";
import { type Conches, conchesTableName } from "./Conches";
import { type Members, membersTableName } from "./Members";

export const userReferralsTableName = "user_referrals" as const;
export const userReferralsIdColumnName = "user_referral_id" as const;

export const userReferralsSchema = z.object({
	[userReferralsIdColumnName]: z.number(),
	created_at: z.date(),
	referred_phone_number: z.string(),
	referred_email: z.string().optional(),
	referred_member_id: z.number(),
	referrer_id: z.number(),
	conch_id: z.number(),
	count: z.number(),
	deleted_date: z.date().optional(),
});

export const userReferralsCreateSchema = userReferralsSchema
	.omit({
		[userReferralsIdColumnName]: true,
		created_at: true,
	})
	.partial({ count: true });

export const userReferralsUpdateSchema = userReferralsCreateSchema.partial();

export type UserReferrals = z.infer<typeof userReferralsSchema>;

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
