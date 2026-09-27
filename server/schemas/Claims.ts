import { z } from "zod";
import {
	claimsIdColumnName,
	claimsTableName,
	conchesIdColumnName,
	membersIdColumnName,
	usersIdColumnName,
	conchesTableName,
	apiDateSchema,
	membersTableName,
	usersTableName,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { idSchema } from "./utils";
import { QueryParamConfig } from "../types";

export const claimsSchema = z.object({
	[claimsIdColumnName]: z.number(),
	created_at: apiDateSchema,
	[conchesIdColumnName]: z.number(),
	[usersIdColumnName]: z.number(),
	[membersIdColumnName]: z.number(),
});

export const claimsCreateSchema = claimsSchema.omit({
	[claimsIdColumnName]: true,
	created_at: true,
	conch_id: true,
});

export const claimsUpdateSchema = claimsCreateSchema
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});
export type Claims = z.infer<typeof claimsSchema>;

export const claimsDependencyEdges: Array<[string, string]> = [
	[claimsTableName, membersTableName],
	[claimsTableName, usersTableName],
	[claimsTableName, conchesTableName],
];

export const createClaimsTableQuery = `
CREATE TABLE ${claimsTableName} (
    ${claimsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	${conchesIdColumnName} integer NOT NULL REFERENCES ${conchesTableName},
	${usersIdColumnName} integer NOT NULL REFERENCES ${usersTableName},
	${membersIdColumnName} integer NOT NULL REFERENCES ${membersTableName}
);`;

const fields: QueryParamConfig["fields"] = [
	{ param: claimsIdColumnName, schema: claimsSchema.shape[claimsIdColumnName] },
	{ param: "created_at", schema: claimsSchema.shape.created_at },
	{
		param: conchesIdColumnName,
		schema: claimsSchema.shape[conchesIdColumnName],
	},
	{ param: usersIdColumnName, schema: claimsSchema.shape[usersIdColumnName] },
	{
		param: membersIdColumnName,
		schema: claimsSchema.shape[membersIdColumnName],
	},
];
const sortFields: QueryParamConfig["sortFields"] = [
	{
		param: "created_at",
		schema: apiDateSchema,
	},
	{
		param: claimsIdColumnName,
		schema: idSchema,
	},
];
export const claimsQueryParamConfig: QueryParamConfig = {
	fields: fields,
	sortFields: sortFields,
	filters: [
		...createdAtFilters,
		{
			columnRef: conchesIdColumnName,
			operator: "=",
			param: conchesIdColumnName,
			schema: idSchema,
		},
		{
			columnRef: usersIdColumnName,
			operator: "=",
			param: usersIdColumnName,
			schema: idSchema,
		},
		{
			columnRef: membersIdColumnName,
			operator: "=",
			param: membersIdColumnName,
			schema: idSchema,
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: sortFields,
	defaultLimit: 50,
	defaultFields: fields,
};
