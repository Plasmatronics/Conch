import { z } from "zod";
import {
	conchesTableName,
	memberReferralsTableName,
	memberReferralsIdColumnName,
	conchesIdColumnName,
	usersTableName,
	membersTableName,
	apiDateSchema,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { QueryParamConfig } from "../types";
import { idSchema } from "./utils";

export const memberReferralsSchema = z.object({
	[memberReferralsIdColumnName]: z.number(),
	created_at: apiDateSchema,
	referred_first_name: z.string(),
	referred_last_name: z.string(),
	referrer_id: z.number(),
	[conchesIdColumnName]: z.number(),
	parent_one_id: z.number().nullable(),
	parent_two_id: z.number().nullable(),
	child_id: z.number().nullable(),
	spouse_id: z.number().nullable(),
	count: z.number(),
});

export const memberReferralsCreateSchema = memberReferralsSchema
	.omit({
		[memberReferralsIdColumnName]: true,
		created_at: true,
		conch_id: true,
	})
	.extend({
		parent_one_id: z.number().nullable().optional(),
		parent_two_id: z.number().nullable().optional(),
		child_id: z.number().nullable().optional(),
		spouse_id: z.number().nullable().optional(),
		count: z.number().default(0),
	});

export const memberReferralsUpdateSchema = memberReferralsCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type MemberReferrals = z.infer<typeof memberReferralsSchema>;

export const memberReferralsDependencyEdges: Array<[string, string]> = [
	[memberReferralsTableName, usersTableName],
	[memberReferralsTableName, conchesTableName],
	[memberReferralsTableName, membersTableName],
];

export const createMemberReferralsQuery = `
CREATE TABLE ${memberReferralsTableName} (
	${memberReferralsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	referred_first_name text NOT NULL,
	referred_last_name text NOT NULL,
	referrer_id integer NOT NULL REFERENCES ${usersTableName},
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	parent_one_id integer REFERENCES ${membersTableName},
	parent_two_id integer REFERENCES ${membersTableName},
	child_id integer REFERENCES ${membersTableName},
	spouse_id integer REFERENCES ${membersTableName},
	count smallint NOT NULL DEFAULT 1
);`;

const sortFields = [
	{
		param: "created_at",
		parseFn: (value: string) => apiDateSchema.parse(value),
	},
	{
		param: memberReferralsIdColumnName,
		parseFn: (value: string) => idSchema.parse(value),
	},
	{
		param: "referred_last_name",
		parseFn: (value: string) =>
			memberReferralsSchema.shape.referred_last_name.parse(value),
	},
	{
		param: "referred_first_name",
		parseFn: (value: string) =>
			memberReferralsSchema.shape.referred_first_name.parse(value),
	},
];
export const memberReferralsQueryParamConfig: QueryParamConfig = {
	fields: [
		memberReferralsIdColumnName,
		"created_at",
		"referred_first_name",
		"referred_last_name",
		"referrer_id",
		conchesIdColumnName,
		"parent_one_id",
		"parent_two_id",
		"child_id",
		"spouse_id",
		"count",
	],
	sortFields,
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
	defaultSortFields: [
		{
			param: "created_at",
			parseFn: (value: string) => apiDateSchema.parse(value),
		},
		{
			param: memberReferralsIdColumnName,
			parseFn: (value: string) => idSchema.parse(value),
		},
	],
	defaultLimit: 50,
	defaultFields: [
		memberReferralsIdColumnName,
		"created_at",
		"referred_first_name",
		"referred_last_name",
		"referrer_id",
		"count",
	],
};
