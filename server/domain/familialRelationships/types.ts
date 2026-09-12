import { GraphRelationship } from "../../schemas";

export interface ConchFamilyGraphInput {
	relationships: GraphRelationship[];
	memberIds: number[];
}

type GeneralFamilyRelation = "Ancestor" | "Descendant" | "In Law" | "Unknown";

type IntimateFamilyRelation =
	| "Self"
	| "Sibling"
	| "Spouse"
	| "Parent"
	| "Child"
	| "Grandparent"
	| "Grandchild"
	| "Great Grandparent"
	| "Great Grandchild"
	| "Niece/Nephew"
	| "Aunt/Uncle"
	| "Cousin";

export type PathFamilyRelation =
	GeneralFamilyRelation | Exclude<IntimateFamilyRelation, "Spouse">;

type NonBloodFamilyRelation = `${Exclude<
	PathFamilyRelation,
	"Self" | "Unknown" | "In Law"
>} In Law`;

type SpousalFamilyRelation =
	"Parent's Spouse" | "Ancestor's Spouse" | "Spouse's Child";

export type FamilyRelation =
	| GeneralFamilyRelation
	| IntimateFamilyRelation
	| NonBloodFamilyRelation
	| SpousalFamilyRelation;
