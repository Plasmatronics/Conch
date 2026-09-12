import { describe, expect, test } from "vitest";
import type { GraphRelationship, Relationship } from "../../schemas";
import { ConchFamilyGraph } from "./ConchFamilyGraph";
import type { ConchFamilyGraphInput } from "./types";

const relationship = (
	relationship_id: number,
	relationship_type: Relationship,
	source_member_id: number,
	target_member_id: number,
): GraphRelationship => ({
	relationship_id,
	relationship_type,
	source_member_id,
	target_member_id,
});

const incestuousFamily: ConchFamilyGraphInput = {
	memberIds: [1, 2, 3, 4, 5],
	relationships: [
		relationship(1, "spouse", 3, 4),
		relationship(2, "child", 3, 1),
		relationship(3, "child", 3, 2),
		relationship(4, "child", 4, 1),
		relationship(5, "child", 4, 2),
		relationship(6, "spouse", 1, 2),
		relationship(7, "child", 1, 5),
		relationship(8, "child", 2, 5),
	],
};

const multipleSpouseFamily: ConchFamilyGraphInput = {
	memberIds: [1, 2, 3, 4, 5, 6, 7],
	relationships: [
		relationship(1, "spouse", 1, 2),
		relationship(2, "spouse", 1, 3),
		relationship(3, "child", 1, 4),
		relationship(4, "child", 2, 4),
		relationship(5, "child", 1, 5),
		relationship(6, "child", 2, 5),
		relationship(7, "child", 1, 6),
		relationship(8, "child", 3, 6),
		relationship(9, "child", 1, 7),
		relationship(10, "child", 3, 7),
	],
};

describe("ConchFamilyGraph", () => {
	test("stores one relationship per member in an incestuous family", () => {
		const graph = new ConchFamilyGraph(incestuousFamily);

		expect(
			incestuousFamily.memberIds.map(
				(memberId) => Object.keys(graph.getRelationships(memberId)).length,
			),
		).toEqual([5, 5, 5, 5, 5]);
	});

	test("resolves overlapping ancestry paths in an incestuous family", () => {
		const graph = new ConchFamilyGraph(incestuousFamily);

		expect(graph.getRelationships(3)).toEqual({
			1: "Child",
			2: "Child",
			3: "Self",
			4: "Spouse",
			5: "Grandchild",
		});
	});

	test("detects ancestry cycles", () => {
		expect(
			() =>
				new ConchFamilyGraph({
					memberIds: [1, 2, 3],
					relationships: [
						relationship(1, "child", 1, 2),
						relationship(2, "child", 2, 3),
						relationship(3, "child", 3, 1),
					],
				}),
		).toThrow(/cycle/i);
	});

	test("resolves every relationship in a small family", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "child", 2, 3),
			],
		});

		expect([
			graph.getRelationships(1),
			graph.getRelationships(2),
			graph.getRelationships(3),
		]).toEqual([
			{ 1: "Self", 2: "Child", 3: "Grandchild" },
			{ 1: "Parent", 2: "Self", 3: "Child" },
			{ 1: "Grandparent", 2: "Parent", 3: "Self" },
		]);
	});

	test("resolves direct, extended, and in-law relationships in a medium family", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3, 4, 5, 6, 7, 8],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "child", 1, 3),
				relationship(3, "child", 2, 4),
				relationship(4, "child", 3, 5),
				relationship(5, "spouse", 4, 6),
				relationship(6, "child", 4, 7),
				relationship(7, "child", 5, 8),
			],
		});

		expect(graph.getRelationships(7)).toEqual({
			1: "Great Grandparent",
			2: "Grandparent",
			3: "Aunt/Uncle",
			4: "Parent",
			5: "Cousin",
			6: "Parent's Spouse",
			7: "Self",
			8: "Cousin",
		});
	});

	test("resolves distant ancestry and branches in a large family", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "child", 2, 3),
				relationship(3, "child", 3, 4),
				relationship(4, "child", 4, 5),
				relationship(5, "child", 1, 6),
				relationship(6, "child", 6, 7),
				relationship(7, "child", 2, 8),
				relationship(15, "spouse", 7, 13),
				relationship(16, "child", 13, 14),
				relationship(17, "child", 7, 14),
				relationship(8, "child", 8, 9),
				relationship(9, "spouse", 1, 10),
				relationship(10, "spouse", 4, 11),
				relationship(11, "child", 7, 12),
			],
		});

		expect(graph.getRelationships(5)).toEqual({
			1: "Ancestor",
			2: "Great Grandparent",
			3: "Grandparent",
			4: "Parent",
			5: "Self",
			6: "Aunt/Uncle",
			7: "Cousin",
			8: "Aunt/Uncle",
			9: "Cousin",
			10: "Ancestor's Spouse",
			11: "Parent's Spouse",
			12: "Cousin",
			13: "Cousin In Law",
			14: "Cousin",
		});

		expect(graph.getRelationships(11)).toEqual({
			1: "Great Grandparent In Law",
			2: "Grandparent In Law",
			3: "Parent In Law",
			4: "Spouse",
			5: "Spouse's Child",
			6: "Aunt/Uncle In Law",
			7: "Cousin In Law",
			8: "Aunt/Uncle In Law",
			9: "Cousin In Law",
			10: "In Law",
			11: "Self",
			12: "Cousin In Law",
			13: "In Law",
			14: "Cousin In Law",
		});
	});

	test("resolves relationships across a very wide family tree", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "child", 1, 3),
				relationship(3, "child", 1, 4),
				relationship(4, "child", 1, 5),
				relationship(5, "child", 1, 6),
				relationship(6, "child", 1, 7),
				relationship(7, "child", 2, 8),
				relationship(8, "child", 3, 9),
				relationship(9, "child", 4, 10),
				relationship(10, "child", 5, 11),
				relationship(11, "child", 6, 12),
				relationship(12, "child", 7, 13),
			],
		});

		expect(graph.getRelationships(8)).toEqual({
			1: "Grandparent",
			2: "Parent",
			3: "Aunt/Uncle",
			4: "Aunt/Uncle",
			5: "Aunt/Uncle",
			6: "Aunt/Uncle",
			7: "Aunt/Uncle",
			8: "Self",
			9: "Cousin",
			10: "Cousin",
			11: "Cousin",
			13: "Cousin",
			12: "Cousin",
		});
	});

	test("resolves distant ancestral and extended relationships", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3, 4, 5, 6, 7],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "child", 2, 3),
				relationship(3, "child", 3, 4),
				relationship(4, "child", 4, 5),
				relationship(5, "child", 1, 6),
				relationship(6, "child", 6, 7),
			],
		});

		expect({
			greatGrandchild: graph.getRelationships(1)[4],
			greatGrandparent: graph.getRelationships(4)[1],
			descendant: graph.getRelationships(1)[5],
			ancestor: graph.getRelationships(5)[1],
			nieceOrNephew: graph.getRelationships(2)[7],
			auntOrUncle: graph.getRelationships(7)[2],
		}).toEqual({
			greatGrandchild: "Great Grandchild",
			greatGrandparent: "Great Grandparent",
			descendant: "Descendant",
			ancestor: "Ancestor",
			nieceOrNephew: "Niece/Nephew",
			auntOrUncle: "Aunt/Uncle",
		});
	});

	test("retrieves relationships for a member that exists", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2],
			relationships: [relationship(1, "spouse", 1, 2)],
		});

		expect(graph.getRelationships(1)).toEqual({ 1: "Self", 2: "Spouse" });
	});

	test("rejects relationship retrieval for a member that does not exist", () => {
		const graph = new ConchFamilyGraph({ memberIds: [1], relationships: [] });

		expect(() => graph.getRelationships(2)).toThrow(
			"Member does not have any documented relationships inside this Conch.",
		);
	});

	test("marks members in separate graph components as unknown", () => {
		const graph = new ConchFamilyGraph({
			memberIds: [1, 2, 3, 4, 5],
			relationships: [
				relationship(1, "child", 1, 2),
				relationship(2, "spouse", 3, 4),
			],
		});

		expect([
			graph.getRelationships(1),
			graph.getRelationships(2),
			graph.getRelationships(3),
			graph.getRelationships(4),
			graph.getRelationships(5),
		]).toEqual([
			{ 1: "Self", 2: "Child", 3: "Unknown", 4: "Unknown", 5: "Unknown" },
			{ 1: "Parent", 2: "Self", 3: "Unknown", 4: "Unknown", 5: "Unknown" },
			{ 1: "Unknown", 2: "Unknown", 3: "Self", 4: "Spouse", 5: "Unknown" },
			{ 1: "Unknown", 2: "Unknown", 3: "Spouse", 4: "Self", 5: "Unknown" },
			{ 1: "Unknown", 2: "Unknown", 3: "Unknown", 4: "Unknown", 5: "Self" },
		]);
	});

	test("resolves a family with multiple spouses from each perspective", () => {
		const graph = new ConchFamilyGraph(multipleSpouseFamily);

		expect({
			bloodMember: graph.getRelationships(1),
			firstSpouse: graph.getRelationships(2),
			secondSpouse: graph.getRelationships(3),
			firstSpouseChild: graph.getRelationships(4),
			secondSpouseChild: graph.getRelationships(6),
		}).toEqual({
			bloodMember: {
				1: "Self",
				2: "Spouse",
				3: "Spouse",
				4: "Child",
				5: "Child",
				6: "Child",
				7: "Child",
			},
			firstSpouse: {
				1: "Spouse",
				2: "Self",
				3: "Unknown",
				4: "Child",
				5: "Child",
				6: "Spouse's Child",
				7: "Spouse's Child",
			},
			secondSpouse: {
				1: "Spouse",
				2: "Unknown",
				3: "Self",
				4: "Spouse's Child",
				5: "Spouse's Child",
				6: "Child",
				7: "Child",
			},
			firstSpouseChild: {
				1: "Parent",
				2: "Parent",
				3: "Parent's Spouse",
				4: "Self",
				5: "Sibling",
				6: "Sibling",
				7: "Sibling",
			},
			secondSpouseChild: {
				1: "Parent",
				2: "Parent's Spouse",
				3: "Parent",
				4: "Sibling",
				5: "Sibling",
				6: "Self",
				7: "Sibling",
			},
		});
	});

	test("throws if ", () => {
		expect(
			() =>
				new ConchFamilyGraph({
					memberIds: [1, 2, 3],
					relationships: [
						relationship(1, "spouse", 1, 2),
						relationship(2, "spouse", 3, 2),
					],
				}),
		).toThrow();
	});

	test("treats spouse edges as symmetric in either stored direction", () => {
		const forwardGraph = new ConchFamilyGraph({
			memberIds: [1, 2],
			relationships: [relationship(1, "spouse", 1, 2)],
		});
		const reverseGraph = new ConchFamilyGraph({
			memberIds: [1, 2],
			relationships: [relationship(1, "spouse", 2, 1)],
		});

		expect([
			forwardGraph.getRelationships(1)[2],
			forwardGraph.getRelationships(2)[1],
			reverseGraph.getRelationships(1)[2],
			reverseGraph.getRelationships(2)[1],
		]).toEqual(["Spouse", "Spouse", "Spouse", "Spouse"]);
	});

	test("ignores friend and pet relationships", () => {
		const friendGraph = new ConchFamilyGraph({
			memberIds: [1, 2],
			relationships: [relationship(1, "friend", 1, 2)],
		});
		const petGraph = new ConchFamilyGraph({
			memberIds: [1, 2],
			relationships: [relationship(1, "pet", 1, 2)],
		});

		expect([
			friendGraph.getRelationships(1),
			petGraph.getRelationships(1),
		]).toEqual([
			{ 1: "Self", 2: "Unknown" },
			{ 1: "Self", 2: "Unknown" },
		]);
	});
});
