import { z } from "zod";
import {
	apiDateSchema,
	conchesIdColumnName,
	conchesTableName,
	membersTableName,
	userReferralsIdColumnName,
	userReferralsTableName,
	usersTableName,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { QueryParamConfig } from "../types";
import { idSchema } from "./utils";

export const userReferralsSchema = z.object({
	[userReferralsIdColumnName]: z.number(),
	created_at: apiDateSchema,
	referred_phone_number: z.string(),
	referred_email: z.email().nullable(),
	referred_member_id: z.number(),
	referrer_id: z.number(),
	[conchesIdColumnName]: z.number(),
	count: z.number(),
});

export const userReferralsCreateSchema = userReferralsSchema
	.omit({
		[userReferralsIdColumnName]: true,
		created_at: true,
		[conchesIdColumnName]: true,
	})
	.extend({
		referred_email: z.email().nullable().optional(),
		count: z.number().default(0),
	});

export const userReferralsUpdateSchema = userReferralsSchema
	.omit({
		[userReferralsIdColumnName]: true,
		created_at: true,
		[conchesIdColumnName]: true,
	})
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

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
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	count smallint NOT NULL DEFAULT 1
);`;

const fields = [
	userReferralsIdColumnName,
	"created_at",
	"referred_phone_number",
	"referred_email",
	"referred_member_id",
	"referrer_id",
	"count",
];
export const userReferralsQueryParamConfig: QueryParamConfig = {
	fields: fields,
	sortFields: ["created_at", "referrer_id", userReferralsIdColumnName],
	filters: [
		...createdAtFilters,
		{
			columnRef: "referrer_id",
			operator: "=",
			param: "referrer_id",
			parseFn: (value: string) => idSchema.parse(value),
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: ["created_at", userReferralsIdColumnName],
	defaultLimit: 50,
	defaultFields: fields,
};
