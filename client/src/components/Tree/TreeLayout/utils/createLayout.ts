import { Node, Edge } from "@xyflow/react";
import dagre from "@dagrejs/dagre";

interface IGetOrientedNodes {
	nodes: Node[];
	edges: Edge[];
	nodeHorizontalMargin: number;
	nodeVerticalMargin: number;
}

export const getOrientedNodes = ({
	nodes,
	edges,
	nodeHorizontalMargin,
	nodeVerticalMargin,
}: IGetOrientedNodes) => {
	const graph: dagre.graphlib.Graph =
		new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

	graph.setGraph({
		rankdir: "TB",
		nodesep: nodeHorizontalMargin,
		ranksep: nodeVerticalMargin,
		marginx: 0,
		marginy: 0,
	});

	nodes.forEach((node) => {
		const w = node.data.width as number;
		const h = node.data.height as number;
		graph.setNode(node.id, { width: w, height: h });
	});

	edges.forEach((edge) => {
		graph.setEdge(edge.source, edge.target);
	});

	dagre.layout(graph);

	const newNodes = nodes.map((node) => {
		const { x, y, width, height } = graph.node(node.id);

		return {
			...node,
			position: { x: x - width / 2, y: y - height / 2 },
		};
	});

	return { nodes: newNodes, edges };
};
