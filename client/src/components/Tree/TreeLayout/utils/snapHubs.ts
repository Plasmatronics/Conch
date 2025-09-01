import type { Node } from "@xyflow/react";

export function snapHubs(nodes: Node[]) {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const getNodeCenterX = (n: Node) =>
		n.position.x + (n.data.width as number) / 2;
	const getNodeCenterY = (n: Node) =>
		n.position.y + (n.data.height as number) / 2;

	for (const n of nodes) {
		// Snap SpouseHub vertically between Descendant and Spouse
		if (n.id.endsWith("SpouseHub")) {
			const descendantId = n.id.replace(/SpouseHub$/, "");
			const spouseId = `${descendantId}Spouse`;

			const descendant = byId.get(descendantId);
			const spouse = byId.get(spouseId);
			if (!descendant || !spouse) continue;

			const hubH = n.data.height as number;
			const midY = (getNodeCenterY(descendant) + getNodeCenterY(spouse)) / 2;

			// keep Dagre's x; force y to perfect midline
			n.position.y = midY - hubH / 2;
		}

		// Snap ChildHub horizontally under spouse
		if (n.id.endsWith("ChildHub")) {
			const descendantId = n.id.replace(/ChildHub$/, "");
			const spouseHub = byId.get(`${descendantId}SpouseHub`);
			if (!spouseHub) continue;

			const hubW = n.data.width as number;
			n.position.x = getNodeCenterX(spouseHub) - hubW / 2;
		}
	}

	return nodes;
}
