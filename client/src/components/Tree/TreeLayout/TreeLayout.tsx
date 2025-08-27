import React from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TreeLayoutProps } from "./TreeLayout.types";
import { getOrientedNodes } from "./utils";
import { Box } from "@chakra-ui/react";
import { initialEdges, initialNodes, nodeTypes } from "./initialEdges";

export const TreeLayout = ({ width }: TreeLayoutProps) => {
	const nodeHorizontalMargin = 300;
	const nodeVerticalMargin = 100;

	const { nodes: orientedNodes, edges: orientedEdges } = getOrientedNodes({
		nodes: initialNodes,
		edges: initialEdges,
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
