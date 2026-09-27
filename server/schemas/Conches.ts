import { z } from "zod";
import {
	conchesIdColumnName,
	conchesTableName,
	usersTableName,
	apiDateSchema,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { idSchema } from "./utils";
import { QueryParamConfig } from "../types";

export const conchesSchema = z.object({
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	confirmations_needed_for_referrals: z.number(),
	admin_id: z.number(),
	created_at: apiDateSchema,
});

export const conchesCreateSchema = conchesSchema
	.omit({
		[conchesIdColumnName]: true,
		created_at: true,
		admin_id: true,
	})
	.extend({
		confirmations_needed_for_referrals: z.number().default(2),
	});

export const conchesUpdateSchema = conchesSchema
	.omit({
		[conchesIdColumnName]: true,
		created_at: true,
		admin_id: true,
	})
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Conches = z.infer<typeof conchesSchema>;

export const conchesDependencyEdges: Array<[string, string]> = [
	[conchesTableName, usersTableName],
];

export const createConchesTableQuery = `
CREATE TABLE ${conchesTableName} (
    ${conchesIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	conch_name text NOT NULL,
	confirmations_needed_for_referrals smallint NOT NULL DEFAULT 2,
	admin_id integer NOT NULL REFERENCES ${usersTableName},
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

/*
	[conchesIdColumnName]: z.number(),
	conch_name: z.string(),
	confirmations_needed_for_referrals: z.number(),
	admin_id: z.number(),
	created_at: apiDateSchema,
*/

const fields: QueryParamConfig["fields"] = [
	{
		param: conchesIdColumnName,
		schema: conchesSchema.shape[conchesIdColumnName],
	},
	{ param: "conch_name", schema: conchesSchema.shape.conch_name },
	{
		param: "confirmations_needed_for_referrals",
		schema: conchesSchema.shape.confirmations_needed_for_referrals,
	},
	{ param: "admin_id", schema: conchesSchema.shape.admin_id },
	{ param: "created_at", schema: conchesSchema.shape.created_at },
];
export const conchesQueryParamConfig: QueryParamConfig = {
	fields: fields,
	sortFields: [
		{
			param: "created_at",
			schema: apiDateSchema,
		},
		{
			param: "conch_name",
			schema: conchesSchema.shape.conch_name,
		},
		{
			param: conchesIdColumnName,
			schema: idSchema,
		},
	],
	filters: [
		...createdAtFilters,
		{
			columnRef: "conch_name",
			operator: "=",
			param: "conch_name",
			schema: conchesSchema.shape.conch_name,
		},
		{
			columnRef: "admin_id",
			operator: "=",
			param: "admin_id",
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
			param: conchesIdColumnName,
			schema: idSchema,
		},
	],
	defaultLimit: 50,
	defaultFields: fields,
};
