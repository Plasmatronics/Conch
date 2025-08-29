import { Box, Flex, Text } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";

const edgeType = "smoothstep";

// keep one source of truth for node size
const NODE_W = 160;
const NODE_H = 80;

function TextUpdaterNode() {
	return (
		<Box
			className="nodrag"
			bg="red.400"
			w={`${NODE_W}px`}
			h={`${NODE_H}px`}
			borderRadius="md"
		>
			<Handle
				type="source"
				position={Position.Bottom}
				style={{
					width: 0,
					height: 0,
					minWidth: 0,
					minHeight: 0,
					opacity: 0,
					background: "transparent",
					border: "none",
					pointerEvents: "none",
				}}
			/>
			<Flex w="100%" h="100%" align="center" justify="center">
				<Text color="white" fontWeight="bold">
					TEXT
				</Text>
			</Flex>
			<Handle
				type="target"
				position={Position.Top}
				style={{
					width: 0,
					height: 0,
					minWidth: 0,
					minHeight: 0,
					opacity: 0,
					background: "transparent",
					border: "none",
					pointerEvents: "none",
				}}
			/>
		</Box>
	);
}

export const nodeTypes = { textUpdater: TextUpdaterNode };

// helper to make nodes with consistent side anchors
const N = (id: string) => ({
	id,
	type: "textUpdater",
	position: { x: 0, y: 0 },
	data: {},
	// tell React Flow which sides to use for routing
	sourcePosition: Position.Top,
	targetPosition: Position.Bottom,
});

export const initialNodes = [
	N("rootMother"),
	N("rootFather"),
	N("firstChild"),
	N("firstSpouse"),
	N("finalChild"),
];

export const initialEdges = [
	{
		id: "rootMother-child",
		source: "rootMother",
		target: "firstChild",
		type: edgeType,
	},
	{
		id: "rootFather-child",
		source: "rootFather",
		target: "firstChild",
		type: edgeType,
	},
	{
		id: "firstChild-finalChild",
		source: "firstChild",
		target: "finalChild",
		type: edgeType,
	},
	{
		id: "firstSpouse-finalChild",
		source: "firstSpouse",
		target: "finalChild",
		type: edgeType,
	},
];
