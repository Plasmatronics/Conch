import { Edge, Node } from "@xyflow/react";

import { TreeLayoutProps } from "../TreeLayout.types";
import { MemberNodeData } from "../components";

export const NODE_HEIGHT = 240;
export const NODE_WIDTH = 160;

export const createNodesAndEdges = ({
	people,
	marriages,
	parentChild,
}: TreeLayoutProps): { nodes: Node<MemberNodeData>[]; edges: Edge[] } => {
	const marriageMap = new Map<string, string[]>(
		marriages.map((marriage) => [marriage.descendantId, marriage.spouseIds]),
	);
	const parentChildMap = new Map<string, string[]>(
		parentChild.map((relationship) => [
			relationship.parentId,
			relationship.childIds,
		]),
	);

	const nodes: Node<MemberNodeData>[] = [];
	const edges: Edge[] = [];

	for (const descendantId of marriageMap.keys()) {
		//push descendant node
		nodes.push({
			id: descendantId,
			type: "member",
			position: { x: 0, y: 0 },
			data: {
				variant: "descendant",
				content: people[descendantId].content.memberData,
				width: NODE_WIDTH,
				height: NODE_HEIGHT,
			},
		});

		if (marriageMap.has(descendantId)) {
			//push spouse node
			nodes.push({
				id: `${descendantId}Spouse`,
				type: "member",
				position: { x: 0, y: 0 },
				data: {
					variant: "spouse",
					content: marriageMap.get(descendantId)!.flatMap((spouseId) => {
						return people[spouseId].content.memberData;
					}),
					width: NODE_WIDTH,
					height: NODE_HEIGHT,
				},
			});
		}

		const childrenIds = parentChildMap.get(descendantId);

		if (childrenIds) {
			for (const childId of childrenIds) {
				edges.push({
					id: `${descendantId}-${childId}`,
					source: descendantId,
					target: childId,
				});
				edges.push({
					id: `${descendantId}Spouse-${childId}`,
					source: `${descendantId}Spouse`,
					target: childId,
				});

				//create node now if child is not married, bc we wont be able to create one later
				if (!marriageMap.has(childId)) {
					nodes.push({
						id: childId,
						type: "member",
						position: { x: 0, y: 0 },
						data: {
							variant: "descendant",
							content: people[childId].content.memberData,
							width: NODE_WIDTH,
							height: NODE_HEIGHT,
						},
					});
				}
			}
		} else {
			//if no children just connect descendant and spouse
			edges.push({
				id: `${descendantId}-${descendantId}Spouse`,
				source: `${descendantId}`,
				target: `${descendantId}Spouse`,
			});
		}
	}

	return { nodes, edges };
};
