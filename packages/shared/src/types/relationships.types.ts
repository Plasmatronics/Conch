import { HydratedFamilyTreeMemberDTO } from "./models";

export type RelationToMember =
	// Self
	| "self"

	// Direct ancestors
	| "parent"
	| "mother"
	| "father"
	| "grandparent"
	| "grandmother"
	| "grandfather"
	| "great-grandmother"
	| "great-grandfather"

	// Direct descendants
	| "child"
	| "son"
	| "daughter"
	| "grandchild"
	| "grandson"
	| "granddaughter"
	| "great-grandson"
	| "great-granddaughter"

	// Siblings
	| "sibling"
	| "brother"
	| "sister"

	// Sibling descendants
	| "nephew"
	| "niece"
	| "great-nephew"
	| "great-niece"

	// Extended family (uncles, cousins, etc.)
	| "uncle"
	| "aunt"
	| "great-uncle"
	| "great-aunt"
	| "cousin"

	// In-laws
	| "spouse"
	| "husband"
	| "wife"
	| "partner"
	| "father-in-law"
	| "mother-in-law"
	| "son-in-law"
	| "daughter-in-law"
	| "brother-in-law"
	| "sister-in-law"

	// Generic catch-alls
	| "ancestor"
	| "descendant"
	| "distant"
	| "friend";

export const nonDirectFamily = [
	"spouse",
	"husband",
	"wife",
	"partner",
	"father-in-law",
	"mother-in-law",
	"son-in-law",
	"daughter-in-law",
	"brother-in-law",
	"sister-in-law",
	"friend",
];

export const RelationToMemberEnum = [
	// Self
	"self",
	// Direct ancestors
	"parent",
	"mother",
	"father",
	"grandparent",
	"grandmother",
	"grandfather",
	"great-grandmother",
	"great-grandfather",
	// Direct descendants
	"child",
	"son",
	"daughter",
	"grandchild",
	"grandson",
	"granddaughter",
	"great-grandson",
	"great-granddaughter",
	// Siblings
	"sibling",
	"brother",
	"sister",
	// Sibling descendants
	"nephew",
	"niece",
	"great-nephew",
	"great-niece",
	// Extended family (uncles, cousins, etc.)
	"uncle",
	"aunt",
	"great-uncle",
	"great-aunt",
	"cousin",
	// In-laws
	"spouse",
	"husband",
	"wife",
	"partner",
	"father-in-law",
	"mother-in-law",
	"son-in-law",
	"daughter-in-law",
	"brother-in-law",
	"sister-in-law",
	// Generic catch-alls
	"ancestor",
	"descendant",
	"distant",
	"friend",
];

export type Relations = Record<
	HydratedFamilyTreeMemberDTO["id"],
	RelationToMember
>;
