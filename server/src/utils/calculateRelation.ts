import { FamilyTreeMemberDoc, RelationToRootMember } from "@conch/shared";
export const calculateRelation = (
	member: FamilyTreeMemberDoc,
	relatedMember: FamilyTreeMemberDoc,
): RelationToRootMember => {
	console.log("calculating!...");
	return "son";
};
