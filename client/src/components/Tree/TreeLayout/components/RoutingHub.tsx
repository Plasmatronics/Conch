import { Box } from "@chakra-ui/react";
import { Handle, NodeTypes, Position } from "@xyflow/react";

export interface RoutingHubData {
	id: string;
	width: React.CSSProperties["width"];
	height: React.CSSProperties["height"];
}

const SOURCE_POSITIONS = [Position.Right, Position.Bottom];
const TARGET_POSITIONS = [Position.Left, Position.Right, Position.Top];

const handleStyles: React.CSSProperties = {
	width: 0,
	height: 0,
	minWidth: 0,
	minHeight: 0,
	border: "none",
	pointerEvents: "none",
	visibility: "hidden",
};

export function RoutingHub({ data }: { data: RoutingHubData }) {
	const { id, width, height } = data;
	return (
		<Box className="nodrag" w={`${width}px`} h={`${height}px`} bg="gray">
			{SOURCE_POSITIONS.map((pos) => (
				<Handle
					key={`src-${pos}-${id}`}
					id={`src-${pos}-${id}`}
					type="source"
					position={pos}
					isConnectable={false}
					style={{ ...handleStyles }}
				/>
			))}
			{TARGET_POSITIONS.map((pos) => (
				<Handle
					key={`tgt-${pos}-${id}`}
					id={`tgt-${pos}-${id}`}
					type="target"
					position={pos}
					isConnectable={false}
					style={{ ...handleStyles }}
				/>
			))}
		</Box>
	);
}

export const hubNodeTypes: NodeTypes = { hub: RoutingHub };
