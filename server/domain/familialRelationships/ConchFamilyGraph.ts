import { Queue } from "mnemonist";
import {
	ConchFamilyGraphInput,
	FamilyRelation,
	PathFamilyRelation,
} from "./types";

export class ConchFamilyGraph {
	private memberIds: number[];
	private parentToChildMap: Record<number, number[]> = {};
	private childToParentMap: Record<number, number[]> = {};
	private bloodToSpouseMap: Record<number, number[]> = {};
	private nonBloodToSpouseMap: Record<number, number> = {};
	private relationshipMap: Record<number, Record<number, FamilyRelation>> = {};

	constructor({ memberIds, relationships }: ConchFamilyGraphInput) {
		this.memberIds = [...memberIds];

		for (const {
			relationship_type,
			source_member_id,
			target_member_id,
		} of relationships) {
			if (relationship_type === "child") {
				if (!(source_member_id in this.parentToChildMap))
					this.parentToChildMap[source_member_id] = [];
				if (!(target_member_id in this.childToParentMap))
					this.childToParentMap[target_member_id] = [];

				this.parentToChildMap[source_member_id].push(target_member_id);
				this.childToParentMap[target_member_id].push(source_member_id);
			} else if (relationship_type === "spouse") {
				if (!(source_member_id in this.bloodToSpouseMap))
					this.bloodToSpouseMap[source_member_id] = [];
				this.bloodToSpouseMap[source_member_id].push(target_member_id);
				this.nonBloodToSpouseMap[target_member_id] = source_member_id;
			}
		}

		this.buildRelationshipMap();
	}

	private buildRelationshipMap(): void {
		const ancestorStepsByMember = this.buildAncestorStepsByMember();

		for (const sourceMemberId of this.memberIds) {
			this.relationshipMap[sourceMemberId] = {};

			for (const targetMemberId of this.memberIds) {
				this.relationshipMap[sourceMemberId][targetMemberId] =
					this.resolveRelationship(
						sourceMemberId,
						targetMemberId,
						ancestorStepsByMember,
					);
			}
		}
	}

	private buildAncestorStepsByMember(): Record<number, Record<number, number>> {
		const ancestorStepsByMember: Record<number, Record<number, number>> = {};

		for (const memberId of this.memberIds)
			ancestorStepsByMember[memberId] = this.buildAncestorSteps(memberId);

		return ancestorStepsByMember;
	}

	private buildAncestorSteps(memberId: number): Record<number, number> {
		const ancestorSteps: Record<number, number> = {
			[memberId]: 0,
		};

		const queue = new Queue<number>();
		queue.enqueue(memberId);

		while (queue.size) {
			const descendantId = queue.dequeue()!;

			for (const parentId of this.childToParentMap[descendantId] ?? []) {
				if (parentId === memberId) {
					throw new Error(
						"A cycle has been found in the family tree. Please remove any cyclic edges.",
					);
				}

				if (parentId in ancestorSteps) continue;

				ancestorSteps[parentId] = ancestorSteps[descendantId] + 1;
				queue.enqueue(parentId);
			}
		}

		return ancestorSteps;
	}

	private resolveRelationship(
		sourceMemberId: number,
		targetMemberId: number,
		ancestorStepsByMember: Record<number, Record<number, number>>,
	): FamilyRelation {
		if (sourceMemberId === targetMemberId) return "Self";

		const areSpouses =
			this.bloodToSpouseMap[sourceMemberId]?.includes(targetMemberId) ||
			this.nonBloodToSpouseMap[targetMemberId] === sourceMemberId ||
			this.bloodToSpouseMap[targetMemberId]?.includes(sourceMemberId) ||
			this.nonBloodToSpouseMap[sourceMemberId] === targetMemberId;

		if (areSpouses) return "Spouse";

		if (this.parentToChildMap[sourceMemberId]?.includes(targetMemberId))
			return "Child";

		if (this.childToParentMap[sourceMemberId]?.includes(targetMemberId))
			return "Parent";

		const sourceBloodMemberId =
			this.nonBloodToSpouseMap[sourceMemberId] ?? sourceMemberId;

		const targetBloodMemberId =
			this.nonBloodToSpouseMap[targetMemberId] ?? targetMemberId;

		const sourceAncestorSteps = ancestorStepsByMember[sourceBloodMemberId];
		const targetAncestorSteps = ancestorStepsByMember[targetBloodMemberId];

		const shortestPath = this.findShortestPath(
			sourceAncestorSteps,
			targetAncestorSteps,
		);

		return this.pathToFamilyRelationResolver(
			shortestPath,
			sourceBloodMemberId === sourceMemberId,
			targetBloodMemberId === targetMemberId,
		);
	}

	private findShortestPath(
		sourceAncestorSteps: Record<number, number>,
		targetAncestorSteps: Record<number, number>,
	): [number, number] | undefined {
		let shortestPath: [number, number] | undefined;

		for (const [ancestorId, upSteps] of Object.entries(sourceAncestorSteps)) {
			const downSteps = targetAncestorSteps[Number(ancestorId)];

			if (downSteps === undefined) continue;

			if (
				!shortestPath ||
				upSteps + downSteps < shortestPath[0] + shortestPath[1]
			) {
				shortestPath = [upSteps, downSteps];
			}
		}

		return shortestPath;
	}

	private pathToFamilyRelationResolver(
		upDownPath: [number, number] | undefined,
		isSourceBlood: boolean,
		isTargetBlood: boolean,
	): FamilyRelation {
		if (
			!upDownPath ||
			(!isSourceBlood &&
				!isTargetBlood &&
				upDownPath[0] === 0 &&
				upDownPath[1] === 0)
		)
			return "Unknown";

		if (!isSourceBlood && !isTargetBlood) return "In Law";

		const [upSteps, downSteps] = upDownPath;
		let relation: PathFamilyRelation = "Unknown";

		if (upSteps === 0) {
			if (downSteps === 0) relation = "Self";
			else if (downSteps === 1) relation = "Child";
			else if (downSteps === 2) relation = "Grandchild";
			else if (downSteps === 3) relation = "Great Grandchild";
			else relation = "Descendant";
		} else if (downSteps === 0) {
			if (upSteps === 1) relation = "Parent";
			else if (upSteps === 2) relation = "Grandparent";
			else if (upSteps === 3) relation = "Great Grandparent";
			else relation = "Ancestor";
		} else if (upSteps === 1 && downSteps === 1) relation = "Sibling";
		else if (upSteps === 1) relation = "Niece/Nephew";
		else if (downSteps === 1) relation = "Aunt/Uncle";
		else if (upSteps >= 2 && downSteps >= 2) relation = "Cousin";

		if (
			relation === "Unknown" ||
			relation === "Self" ||
			(isSourceBlood && isTargetBlood)
		)
			return relation;

		if (!isSourceBlood) {
			if (!upSteps) return `Spouse's ${relation}` as FamilyRelation;
			return `${relation} In Law`;
		} else if (!isTargetBlood) {
			if (!downSteps) return `${relation}'s Spouse` as FamilyRelation;
			return `${relation} In Law`;
		}

		return relation;
	}

	getRelationships(member_id: number): Record<number, FamilyRelation> {
		if (!(member_id in this.relationshipMap))
			throw new Error(
				"Member does not have any documented relationships inside this Conch.",
			);

		return { ...this.relationshipMap[member_id] };
	}

	getRelationship(member_id: number, target_member_id: number): FamilyRelation {
		if (!(member_id in this.relationshipMap))
			throw new Error(
				"Member does not have any documented relationships inside this Conch.",
			);
		const relationship = this.relationshipMap[member_id][target_member_id];
		if (!relationship)
			throw new Error(
				"Member does not have any documented relationship to specified target member inside this Conch.",
			);

		return relationship;
	}
}
