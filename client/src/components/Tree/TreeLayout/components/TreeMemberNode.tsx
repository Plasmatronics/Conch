import { Box } from "@chakra-ui/react";
import { TreeCard, TreeCardProps } from "../../TreeCard";
import { Handle, NodeTypes, Position } from "@xyflow/react";

type TreeNodeVariant = "spouse" | "descendant";

export interface MemberNodeData extends Record<string, unknown> {
	content: TreeCardProps["memberData"];
	variant: TreeNodeVariant;
	width: TreeCardProps["width"];
	height: TreeCardProps["height"];
}

const handleStyles: React.CSSProperties = {
	width: 0,
	height: 0,
	minWidth: 0,
	minHeight: 0,
	opacity: 0,
	background: "transparent",
	border: "none",
	pointerEvents: "none",
};

export const TreeMemberNode = ({ data }: { data: MemberNodeData }) => {
	const { content, variant, width, height } = data;

	return (
		<Box
			borderRadius="md"
			className="nodrag"
			w={`${width}px`}
			h={`${height}px`}
		>
			<Handle
				type="source"
				position={variant === "spouse" ? Position.Left : Position.Right}
				isConnectable={false}
				style={{
					...handleStyles,
				}}
			/>
			<TreeCard memberData={content} width={width} height={height} />
			<Handle
				type="target"
				position={variant === "spouse" ? Position.Left : Position.Top}
				isConnectable={false}
				style={{
					...handleStyles,
				}}
			/>
		</Box>
	);
};

export const memberNodeTypes: NodeTypes = { member: TreeMemberNode };
