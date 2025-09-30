import React from "react";
import { DataTreeLayoutProps } from "./DataTreeLayout.types";
import { useDataTreeLayout } from "./useDataTreeLayout";
import { TreeLayout } from "../TreeLayout";
import { Spinner } from "@chakra-ui/react";

export const DataTreeLayout = ({ userId }: DataTreeLayoutProps) => {
	const { treeLayoutQuery, peopleMap, marriages, parentChild } =
		useDataTreeLayout({ userId });

	return treeLayoutQuery.isLoading ? (
		<Spinner
			size="xl"
			color="gray.200"
			borderWidth="5px"
			animationDuration="0.7s"
		/>
	) : (
		<TreeLayout
			people={peopleMap}
			marriages={marriages}
			parentChild={parentChild}
		/>
	);
};
