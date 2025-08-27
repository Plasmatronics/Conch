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

	graph.setGraph({ rankdir: "TB" });

	nodes.forEach((node) => {
		graph.setNode(node.id, {
			width: nodeHorizontalMargin,
			height: nodeVerticalMargin,
		});
	});

	edges.forEach((edge) => {
		graph.setEdge(edge.source, edge.target);
	});

	dagre.layout(graph);

	const newNodes = nodes.map((node) => {
		const nodeWithPosition = graph.node(node.id);
		const newNode = {
			...node,
			position: {
				x: nodeWithPosition.x - nodeHorizontalMargin / 2,
				y: nodeWithPosition.y - nodeVerticalMargin / 2,
			},
		};

		return newNode;
	});

	return { nodes: newNodes, edges };
};
