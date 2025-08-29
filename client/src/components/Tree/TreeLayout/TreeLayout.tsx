import React from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TreeLayoutProps } from "./TreeLayout.types";
import { getOrientedNodes } from "./utils/createLayout";
import { Box } from "@chakra-ui/react";
import { createNodesAndEdges } from "./utils/nodeEdgeFactory";
import { nodeTypes } from "./components";

export const TreeLayout = ({
	people,
	marriages,
	parentChild,
}: TreeLayoutProps) => {
	const nodeHorizontalMargin = 300;
	const nodeVerticalMargin = 100;

	const { nodes: rawNodes, edges: rawEdges } = createNodesAndEdges({
		people,
		marriages,
		parentChild,
	});

	const { nodes: orientedNodes, edges: orientedEdges } = getOrientedNodes({
		nodes: rawNodes,
		edges: rawEdges,
		nodeHorizontalMargin,
		nodeVerticalMargin,
	});

	return (
		<Box width="100vw" height="100vh">
			<ReactFlow
				nodes={orientedNodes}
				nodeTypes={nodeTypes}
				edges={orientedEdges}
				fitView
				proOptions={{ hideAttribution: true }}
			/>
		</Box>
	);
};
