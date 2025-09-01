import { Edge, Node } from "@xyflow/react";
import { TreeLayoutProps } from "../TreeLayout.types";

export const NODE_HEIGHT = 240;
export const NODE_WIDTH = 160;

export const HUB_WIDTH = 1;
export const HUB_HEIGHT = 1;

//  edgeTypes: bezier, smoothstep, step, and straight
const edgeType = "smoothstep";

export const createNodesAndEdges = ({
	people,
	marriages,
	parentChild,
}: TreeLayoutProps): { nodes: Node[]; edges: Edge[] } => {
	const marriageMap = new Map<string, string[]>(
		marriages.map((marriage) => [marriage.descendantId, marriage.spouseIds]),
	);
	const parentChildMap = new Map<string, string[]>(
		parentChild.map((relationship) => [
			relationship.parentId,
			relationship.childIds,
		]),
	);

	const nodes: Node[] = [];
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
				id: `${descendantId}SpouseHub`,
				type: "hub",
				position: { x: 0, y: 0 },
				data: {
					id: `${descendantId}SpouseHub`,
					width: HUB_WIDTH,
					height: HUB_HEIGHT,
				},
			});

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

			//connecting each spouse to spouse hub
			edges.push({
				id: `${descendantId}-Hub`,
				source: descendantId,
				target: `${descendantId}SpouseHub`,
				targetHandle: `tgt-left-${descendantId}SpouseHub`,
				selectable: false,
				type: edgeType,
			});
			edges.push({
				id: `${descendantId}Spouse-${descendantId}SpouseHub`,
				source: `${descendantId}Spouse`,
				target: `${descendantId}SpouseHub`,
				targetHandle: `tgt-right-${descendantId}SpouseHub`,
				selectable: false,
				type: edgeType,
			});
		}

		const childrenIds = parentChildMap.get(descendantId);

		if (childrenIds) {
			//creating children hub and connecting spouse hub to children hub
			nodes.push({
				id: `${descendantId}ChildHub`,
				type: "hub",
				position: { x: 0, y: 0 },
				data: {
					id: `${descendantId}ChildHub`,
					width: HUB_WIDTH,
					height: HUB_HEIGHT,
				},
			});
			edges.push({
				id: `${descendantId}SpouseHub-${descendantId}ChildHub`,
				source: `${descendantId}SpouseHub`,
				target: `${descendantId}ChildHub`,
				sourceHandle: `src-bottom-${descendantId}SpouseHub`,
				targetHandle: `tgt-top-${descendantId}ChildHub`,
				selectable: false,
				type: edgeType,
			});

			for (const childId of childrenIds) {
				edges.push({
					id: `${descendantId}ChildHub-${childId}`,
					source: `${descendantId}ChildHub`,
					sourceHandle: `src-bottom-${descendantId}ChildHub`,
					selectable: false,
					target: childId,
					type: edgeType,
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
		}
	}
	return { nodes, edges };
};
