import { Node, Edge } from "@xyflow/react";
import dagre from "@dagrejs/dagre";

interface IGetOrientedNodesAndEdges {
	nodes: Node[];
	edges: Edge[];
	nodeHorizontalMargin: number;
	nodeVerticalMargin: number;
}

export const getOrientedNodesAndEdges = ({
	nodes,
	edges,
	nodeHorizontalMargin,
	nodeVerticalMargin,
}: IGetOrientedNodesAndEdges) => {
	const graph: dagre.graphlib.Graph =
		new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

	graph.setGraph({
		rankdir: "TB",
		nodesep: nodeHorizontalMargin,
		ranksep: nodeVerticalMargin,
		marginx: 0,
		marginy: 0,
		ranker: "tight-tree",
	});

	nodes.forEach((node) => {
		graph.setNode(node.id, {
			width: node.data.width as number,
			height: node.data.height as number,
		});
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
