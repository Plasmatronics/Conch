import { z } from "zod";
import {
	apiDateSchema,
	membersTableName,
	relationshipsIdColumnName,
	relationshipsTableName,
} from "./shared";
import { createdAtFilters } from "./shared/filters";
import { QueryParamConfig } from "../types";
import { idSchema } from "./utils";

export type Relationship = "spouse" | "child" | "pet" | "friend";

export const relationshipsSchema = z.object({
	[relationshipsIdColumnName]: z.number(),
	relationship_type: z.enum(["spouse", "child", "pet", "friend"]),
	created_at: apiDateSchema,
	source_member_id: z.number(),
	target_member_id: z.number(),
	is_current: z.boolean(),
});

export const relationshipsCreateSchema = relationshipsSchema
	.omit({
		[relationshipsIdColumnName]: true,
		created_at: true,
		is_current: true,
	})
	.extend({
		is_current: z.boolean().default(true),
	});

export const relationshipsGraphSchema = relationshipsSchema.omit({
	created_at: true,
});
export type GraphRelationship = z.infer<typeof relationshipsGraphSchema>;

export const relationshipsUpdateSchema = relationshipsGraphSchema
	.omit({ [relationshipsIdColumnName]: true })
	.partial()
	.refine((obj) => Object.keys(obj).length > 0, {
		message: "At least one field must be provided",
	});

export type Relationships = z.infer<typeof relationshipsSchema>;

export const relationshipsDependencyEdges: Array<[string, string]> = [
	[relationshipsTableName, membersTableName],
];

export const createRelationshipTypeEnumQuery = `
CREATE TYPE relationship AS ENUM ('spouse', 'child', 'friend', 'pet');
`;
export const createRelationshipsTableQuery = `
CREATE TABLE ${relationshipsTableName} (
	${relationshipsIdColumnName} integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	relationship_type relationship NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	source_member_id integer NOT NULL REFERENCES ${membersTableName},
	target_member_id integer NOT NULL REFERENCES ${membersTableName},
	is_current boolean DEFAULT true;
);`;

const fields = [
	relationshipsIdColumnName,
	"created_at",
	"relationship_type",
	"source_member_id",
	"target_member_id",
	"is_current",
];
export const relationshipsQueryParamConfig: QueryParamConfig = {
	fields: fields,
	sortFields: ["created_at", "relationship_type", relationshipsIdColumnName],
	filters: [
		...createdAtFilters,
		{
			columnRef: "source_member_id",
			operator: "=",
			param: "source_member_id",
			parseFn: (value: string) => idSchema.parse(value),
		},
		{
			columnRef: "target_member_id",
			operator: "=",
			param: "target_member_id",
			parseFn: (value: string) => idSchema.parse(value),
		},
		{
			columnRef: "relationship_type",
			operator: "=",
			param: "relationship_type",
			parseFn: (value: string) =>
				relationshipsSchema.shape.relationship_type.parse(value),
		},
		{
			columnRef: "is_current",
			operator: "=",
			param: "is_current",
			parseFn: (value: string) => z.coerce.boolean().parse(value),
		},
	],
	defaultSortDir: "DESC",
	defaultSortFields: ["created_at", relationshipsIdColumnName],
	defaultLimit: 50,
	defaultFields: fields,
};
