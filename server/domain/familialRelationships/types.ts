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

type CurrentSpousalFamilyRelation =
	| "Parent's Spouse"
	| "Ancestor's Spouse"
	| "Spouse's Child"
	| "Spouse's Spouse"
	| "Spouse's Ex-Spouse";
type ExSpousalFamilyRelation =
	| "Parent's Ex-Spouse"
	| "Ancestor's Ex-Spouse"
	| "Ex-Spouse's Child"
	| "Ex-Spouse"
	| "Ex-Spouse's Spouse"
	| "Ex-Spouse's Ex-Spouse";
type SpousalFamilyRelation =
	CurrentSpousalFamilyRelation | ExSpousalFamilyRelation;

export type NonFamilialRelationships = "Family Friend" | "Family Pet";

export type FamilyRelation =
	| GeneralFamilyRelation
	| IntimateFamilyRelation
	| NonBloodFamilyRelation
	| SpousalFamilyRelation
	| NonFamilialRelationships;
