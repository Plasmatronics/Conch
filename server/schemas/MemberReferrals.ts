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

const sortFields: QueryParamConfig["sortFields"] = [
	{
		param: "created_at",
		schema: apiDateSchema,
	},
	{
		param: memberReferralsIdColumnName,
		schema: idSchema,
	},
	{
		param: "referred_last_name",
		schema: memberReferralsSchema.shape.referred_last_name,
	},
	{
		param: "referred_first_name",
		schema: memberReferralsSchema.shape.referred_first_name,
	},
];
export const memberReferralsQueryParamConfig: QueryParamConfig = {
	fields: [
		{
			param: memberReferralsIdColumnName,
			schema: memberReferralsSchema.shape[memberReferralsIdColumnName],
		},
		{ param: "created_at", schema: memberReferralsSchema.shape.created_at },
		{
			param: "referred_first_name",
			schema: memberReferralsSchema.shape.referred_first_name,
		},
		{
			param: "referred_last_name",
			schema: memberReferralsSchema.shape.referred_last_name,
		},
		{ param: "referrer_id", schema: memberReferralsSchema.shape.referrer_id },
		{
			param: conchesIdColumnName,
			schema: memberReferralsSchema.shape[conchesIdColumnName],
		},
		{
			param: "parent_one_id",
			schema: memberReferralsSchema.shape.parent_one_id,
		},
		{
			param: "parent_two_id",
			schema: memberReferralsSchema.shape.parent_two_id,
		},
		{ param: "child_id", schema: memberReferralsSchema.shape.child_id },
		{ param: "spouse_id", schema: memberReferralsSchema.shape.spouse_id },
		{ param: "count", schema: memberReferralsSchema.shape.count },
	],
	sortFields,
	filters: [
		...createdAtFilters,
		{
			columnRef: "referrer_id",
			operator: "=",
			param: "referrer_id",
			schema: idSchema,
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: [
		{
			param: "created_at",
			schema: apiDateSchema,
		},
		{
			param: memberReferralsIdColumnName,
			schema: idSchema,
		},
	],
	defaultLimit: 50,
	defaultFields: [
		{
			param: memberReferralsIdColumnName,
			schema: memberReferralsSchema.shape[memberReferralsIdColumnName],
		},
		{ param: "created_at", schema: memberReferralsSchema.shape.created_at },
		{
			param: "referred_first_name",
			schema: memberReferralsSchema.shape.referred_first_name,
		},
		{
			param: "referred_last_name",
			schema: memberReferralsSchema.shape.referred_last_name,
		},
		{ param: "referrer_id", schema: memberReferralsSchema.shape.referrer_id },
		{ param: "count", schema: memberReferralsSchema.shape.count },
	],
};
