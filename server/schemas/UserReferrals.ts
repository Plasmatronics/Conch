import { z } from "zod";
import { usersTableName } from "./Users";
import { conchesTableName } from "./Conches";
import { membersTableName } from "./Members";
import { apiDateSchema } from "./shared";

export const userReferralsTableName = "user_referrals" as const;
export const userReferralsIdColumnName = "user_referral_id" as const;

export const userReferralsSchema = z.object({
	[userReferralsIdColumnName]: z.number(),
	created_at: apiDateSchema,
	referred_phone_number: z.string(),
	referred_email: z.email().optional(),
	referred_member_id: z.number(),
	referrer_id: z.number(),
	conch_id: z.number(),
	count: z.number(),
	deleted_date: apiDateSchema.optional(),
});

export const userReferralsCreateSchema = userReferralsSchema
	.omit({
		[userReferralsIdColumnName]: true,
		created_at: true,
		deleted_date: true,
	})
	.extend({
		count: z.number().default(0),
	});

export const userReferralsUpdateSchema = userReferralsCreateSchema.partial();

export type UserReferrals = z.infer<typeof userReferralsSchema>;

export const userReferralsDependencyEdges: Array<[string, string]> = [
	[userReferralsTableName, membersTableName],
	[userReferralsTableName, usersTableName],
	[userReferralsTableName, conchesTableName],
];

export const createUserReferralsQuery = `
CREATE TABLE ${userReferralsTableName} (
	${userReferralsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_phone_number text NOT NULL,
	referred_email text,
	referred_member_id integer NOT NULL REFERENCES ${membersTableName},
	referrer_id integer NOT NULL REFERENCES ${usersTableName},
	conch_id integer NOT NULL REFERENCES ${conchesTableName},
	count smallint NOT NULL DEFAULT 1,
    deleted_date timestamptz
);`;
