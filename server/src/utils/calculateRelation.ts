import { PopulatedFamilyTreeMemberDTO, RelationToMember } from "@conch/shared";

export const calculateRelation = (
	member: PopulatedFamilyTreeMemberDTO,
	relatedMember: PopulatedFamilyTreeMemberDTO,
	allMembers: PopulatedFamilyTreeMemberDTO[],
): RelationToMember => {
	if (!relatedMember.isRelated) return "friend";

	const membersRecord: Record<string, PopulatedFamilyTreeMemberDTO> = {};
	for (const member of allMembers) membersRecord[member.id] = member;

	if (member.id === relatedMember.id) return "self";

	const immediateMember = getImmediateRelation(member, relatedMember);
	if (immediateMember) return immediateMember;

	const extendedMember = getExtendedRelation(
		member,
		relatedMember,
		membersRecord,
	);
	if (extendedMember) return extendedMember;

	const descendant = getDescendantRelation(
		member,
		relatedMember,
		membersRecord,
	);
	if (descendant) return descendant;

	const inLawMember = getInLawRelation(member, relatedMember, membersRecord);
	if (inLawMember) return inLawMember;

	if (isAncestorOf(member, relatedMember, membersRecord)) return "ancestor";
	if (isAncestorOf(relatedMember, member, membersRecord)) return "descendant";

	return "distant";
};

function getImmediateRelation(
	member: PopulatedFamilyTreeMemberDTO,
	related: PopulatedFamilyTreeMemberDTO,
): RelationToMember | null {
	if (member.parents?.some((parent) => parent.id === related.id))
		return related.gender === "Male" ? "father" : "mother";

	if (member.children?.some((child) => child.id === related.id))
		return related.gender === "Male" ? "son" : "daughter";

	if (member.spouses?.some((spouse) => spouse.id === related.id))
		return related.gender === "Male" ? "husband" : "wife";

	if (member.dated?.some((partner) => partner.id === related.id))
		return "partner";

	return null;
}

// handles grandparents, siblings, uncles/aunts, cousins, etc.
function getExtendedRelation(
	member: PopulatedFamilyTreeMemberDTO,
	related: PopulatedFamilyTreeMemberDTO,
	allMembers: Record<string, PopulatedFamilyTreeMemberDTO>,
): RelationToMember | null {
	for (const parentObj of member.parents || []) {
		const parent = allMembers[parentObj.id];
		if (!parent) continue;

		// grandparents
		if (parent.parents?.some((grandparents) => grandparents.id === related.id))
			return related.gender === "Male" ? "grandfather" : "grandmother";

		// siblings
		if (
			parent.children?.some(
				(children) => children.id === related.id && children.id !== member.id,
			)
		)
			return related.gender === "Male" ? "brother" : "sister";

		// check grandparent level for great-grandparents, uncles/aunts, cousins
		for (const grandparentObj of parent.parents || []) {
			const grandparent = allMembers[grandparentObj.id];
			if (!grandparent) continue;

			// great grandparents
			if (
				grandparent.parents?.some(
					(greatGrandparent) => greatGrandparent.id === related.id,
				)
			)
				return related.gender === "Male"
					? "great-grandfather"
					: "great-grandmother";

			// uncle/aunt
			for (const uncleAuntObj of grandparent.children || []) {
				const uncleAunt = allMembers[uncleAuntObj.id];
				if (!uncleAunt) continue;

				if (uncleAunt.id === related.id)
					return related.gender === "Male" ? "uncle" : "aunt";

				// cousin
				if (uncleAunt.children?.some((cousin) => cousin.id === related.id))
					return "cousin";

				// great uncle/aunt
				for (const greatGrandparentObj of grandparent.parents || []) {
					const greatGrandparent = allMembers[greatGrandparentObj.id];
					if (!greatGrandparent) continue;

					for (const greatUncleAuntObj of greatGrandparent.children || []) {
						const greatUncleAunt = allMembers[greatUncleAuntObj.id];
						if (greatUncleAunt?.id === related.id)
							return related.gender === "Male" ? "great-uncle" : "great-aunt";
					}
				}
			}
		}
	}
	return null;
}

function getDescendantRelation(
	member: PopulatedFamilyTreeMemberDTO,
	related: PopulatedFamilyTreeMemberDTO,
	allMembers: Record<string, PopulatedFamilyTreeMemberDTO>,
): RelationToMember | null {
	for (const childObj of member.children || []) {
		const child = allMembers[childObj.id];
		if (!child) continue;

		if (
			child.children?.some((grandChildren) => grandChildren.id === related.id)
		)
			return related.gender === "Male" ? "grandson" : "granddaughter";

		for (const grandchildrenObj of child.children || []) {
			const grandchild = allMembers[grandchildrenObj.id];
			if (
				grandchild?.children?.some(
					(greatGrandChild) => greatGrandChild.id === related.id,
				)
			)
				return related.gender === "Male"
					? "great-grandson"
					: "great-granddaughter";
		}
	}
	return null;
}

function getInLawRelation(
	member: PopulatedFamilyTreeMemberDTO,
	related: PopulatedFamilyTreeMemberDTO,
	allMembers: Record<string, PopulatedFamilyTreeMemberDTO>,
): RelationToMember | null {
	for (const spouseObj of member.spouses || []) {
		const spouse = allMembers[spouseObj.id];
		if (!spouse) continue;

		if (spouse.parents?.some((parentInLaw) => parentInLaw.id === related.id))
			return related.gender === "Male" ? "father-in-law" : "mother-in-law";

		for (const parentObj of spouse.parents || []) {
			const parent = allMembers[parentObj.id];
			if (!parent) continue;
			if (
				parent.children?.some((siblingInLaw) => siblingInLaw.id === related.id)
			)
				return related.gender === "Male" ? "brother-in-law" : "sister-in-law";
		}
	}

	for (const childObj of member.children || []) {
		const child = allMembers[childObj.id];
		if (!child) continue;

		if (child.spouses?.some((childInLaw) => childInLaw.id === related.id))
			return related.gender === "Male" ? "son-in-law" : "daughter-in-law";
	}

	return null;
}

function isAncestorOf(
	member: PopulatedFamilyTreeMemberDTO,
	related: PopulatedFamilyTreeMemberDTO,
	allMembers: Record<string, PopulatedFamilyTreeMemberDTO>,
	visited = new Set<string>(),
): boolean {
	if (visited.has(related.id)) return false;
	visited.add(related.id);

	if (related.parents?.some((parent) => parent.id === member.id)) return true;

	for (const parentObj of related.parents || []) {
		const parent = allMembers[parentObj.id];
		if (parent && isAncestorOf(member, parent, allMembers, visited))
			return true;
	}

	return false;
}
