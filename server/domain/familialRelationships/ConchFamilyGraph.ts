import { Queue } from "mnemonist";
import {
	AllFamilyRelations,
	ConchFamilyGraphInput,
	FamilyRelation,
	MembersFamilyRelations,
	NonFamilialRelationships,
	PathFamilyRelation,
} from "./ConchFamilyGraph.types";
import z from "zod";
import { relationshipsGraphSchema } from "../../schemas";

export const ConchFamilyGraphInputSchema = z.object({
	relationships: z.array(relationshipsGraphSchema),
	memberIds: z.array(z.number()),
});

export class ConchFamilyGraph {
	private memberIds: number[] = [];
	private parentToChildMap: Record<number, number[]> = {};
	private childToParentMap: Record<number, number[]> = {};
	private bloodToSpouseMap: Record<number, number[]> = {};
	private nonBloodToSpouseMap: Record<number, number> = {};
	private relationshipMap: AllFamilyRelations = {};
	private currentMarriageMap: Record<string, boolean> = {};
	private nonFamilialRelationships: Record<number, NonFamilialRelationships> =
		{};

	buildRelationshipMap({
		memberIds,
		relationships,
	}: ConchFamilyGraphInput): void {
		this.memberIds = [...memberIds];

		for (const {
			is_current,
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

				if (target_member_id in this.nonBloodToSpouseMap) {
					throw new Error(
						"A non-blood member cannot be associated with multiple blood spouses.",
					);
				}

				this.nonBloodToSpouseMap[target_member_id] = source_member_id;

				const key = `${source_member_id}-${target_member_id}`;
				const isMarriageActive = this.currentMarriageMap[key];
				if (isMarriageActive !== undefined && isMarriageActive !== is_current)
					throw new Error(
						"A marriage must reflect the same current state bidirectionally.",
					);

				this.currentMarriageMap[key] = is_current;
			} else {
				this.nonFamilialRelationships[target_member_id] =
					relationship_type === "friend" ? "Family Friend" : "Family Pet";
			}
		}
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

	getRelationships(member_id: number): MembersFamilyRelations {
		if (!(member_id in this.relationshipMap))
			throw new Error(
				"Member does not have any documented relationships inside this Conch.",
			);

		return {
			...this.relationshipMap[member_id],
			...this.nonFamilialRelationships,
		};
	}

	getRelationship(member_id: number, target_member_id: number): FamilyRelation {
		if (!(member_id in this.relationshipMap))
			throw new Error(
				"Member does not have any documented relationships inside this Conch.",
			);
		const nonFamlialRelationship =
			this.nonFamilialRelationships[target_member_id];
		if (nonFamlialRelationship) return nonFamlialRelationship;

		const familialRelationship =
			this.relationshipMap[member_id][target_member_id];
		if (!familialRelationship)
			throw new Error(
				"Member does not have any documented relationship to specified target member inside this Conch.",
			);

		return familialRelationship;
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

	private checkIsInMarriage(
		memberA: number,
		memberB: number,
	): { isMarried: boolean; isActive: boolean } {
		const keyA = `${memberA}-${memberB}`;
		const keyB = `${memberB}-${memberA}`;
		const isMarried =
			this.currentMarriageMap[keyA] !== undefined ||
			this.currentMarriageMap[keyB] !== undefined;
		const isActive =
			this.currentMarriageMap[keyA] || this.currentMarriageMap[keyB];

		return {
			isMarried,
			isActive,
		};
	}

	private resolveRelationship(
		sourceMemberId: number,
		targetMemberId: number,
		ancestorStepsByMember: Record<number, Record<number, number>>,
	): FamilyRelation {
		if (sourceMemberId === targetMemberId) return "Self";

		const { isMarried, isActive } = this.checkIsInMarriage(
			sourceMemberId,
			targetMemberId,
		);
		if (isMarried) return isActive ? "Spouse" : "Ex-Spouse";

		const areEskimoSiblings =
			this.nonBloodToSpouseMap[sourceMemberId] !== undefined &&
			this.nonBloodToSpouseMap[targetMemberId] !== undefined &&
			this.nonBloodToSpouseMap[sourceMemberId] ===
				this.nonBloodToSpouseMap[targetMemberId];

		if (areEskimoSiblings) {
			const sharedSpouse = this.nonBloodToSpouseMap[sourceMemberId];
			const { isActive: isSourceActive, isMarried: sourceMar } =
				this.checkIsInMarriage(sourceMemberId, sharedSpouse);
			const { isActive: isTargetActive, isMarried: targetMar } =
				this.checkIsInMarriage(targetMemberId, sharedSpouse);

			if (isSourceActive)
				return isTargetActive ? "Spouse's Spouse" : "Spouse's Ex-Spouse";
			else
				return isTargetActive ? "Ex-Spouse's Spouse" : "Ex-Spouse's Ex-Spouse";
		}

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

		if (shortestPath && !shortestPath[0] && shortestPath[1] === 1)
			return this.resolveChildRelationship(sourceMemberId, targetMemberId);
		if (shortestPath && shortestPath[0] === 1 && !shortestPath[1])
			return this.resolveParentRelationship(sourceMemberId, targetMemberId);
		else
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
			)
				shortestPath = [upSteps, downSteps];
		}

		return shortestPath;
	}

	private resolveChildRelationship(
		sourceMemberId: number,
		targetMemberId: number,
	): FamilyRelation {
		if (this.parentToChildMap[sourceMemberId]?.includes(targetMemberId))
			return "Child";

		const { isMarried, isActive } = this.checkIsInMarriage(
			this.nonBloodToSpouseMap[sourceMemberId],
			sourceMemberId,
		);
		if (!isMarried) return "Unknown";

		return isActive ? "Spouse's Child" : "Ex-Spouse's Child";
	}

	private resolveParentRelationship(
		sourceMemberId: number,
		targetMemberId: number,
	): FamilyRelation {
		if (this.childToParentMap[sourceMemberId]?.includes(targetMemberId))
			return "Parent";

		if (this.nonBloodToSpouseMap[sourceMemberId] !== undefined)
			return "Parent In Law";

		const { isMarried, isActive } = this.checkIsInMarriage(
			this.nonBloodToSpouseMap[targetMemberId],
			targetMemberId,
		);
		if (!isMarried) return "Unknown";

		return isActive ? "Parent's Spouse" : "Parent's Ex-Spouse";
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
}

export class ConchFamilyGraphFactory {
	createConchFamilyGraph(): ConchFamilyGraph {
		return new ConchFamilyGraph();
	}
}
