import React from "react";
import { ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TreeLayoutProps } from "./TreeLayout.types";
import { getOrientedNodesAndEdges } from "./utils/createLayout";
import { Box } from "@chakra-ui/react";
import { createNodesAndEdges } from "./utils/createNodesAndEdges";
import { hubNodeTypes, memberNodeTypes } from "./components";
import { snapHubs } from "./utils/snapHubs";

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

	const { nodes: orientedNodes, edges: orientedEdges } =
		getOrientedNodesAndEdges({
			nodes: rawNodes,
			edges: rawEdges,
			nodeHorizontalMargin,
			nodeVerticalMargin,
		});

	const snappedNodes = snapHubs(orientedNodes);

	return (
		<Box width="100vw" height="100vh" bg="gray.100">
			<ReactFlow
				nodes={snappedNodes}
				nodeTypes={{ ...memberNodeTypes, ...hubNodeTypes }}
				edges={orientedEdges}
				fitView
				proOptions={{ hideAttribution: true }}
			/>
		</Box>
	);
};
