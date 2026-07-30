import { dependencyEdges, nodeToCreationQueryMap } from "../../schemas";
import { Queue } from "mnemonist";
export const determineTopologicalOrderingOfTableCreation = (): string[] => {
	const order: string[] = [];

	const successorsByNodeMap: Record<string, string[]> = {};
	const indegreeMap: Record<string, number> = {};
	for (const node of Object.keys(nodeToCreationQueryMap)) {
		successorsByNodeMap[node] = [];
		indegreeMap[node] = 0;
	}

	for (const [successor, prerequisite] of dependencyEdges) {
		if (!(successor in indegreeMap)) {
			throw new Error(`Unknown successor table: ${successor}`);
		}

		if (!(prerequisite in successorsByNodeMap)) {
			throw new Error(`Unknown prerequisite table: ${prerequisite}`);
		}

		indegreeMap[successor]++;
		successorsByNodeMap[prerequisite].push(successor);
	}

	const queue = new Queue<string>();
	for (const [node, numPreReqs] of Object.entries(indegreeMap)) {
		if (numPreReqs === 0) queue.enqueue(node);
	}

	while (queue.size) {
		const poppedNode = queue.dequeue();
		if (!poppedNode) continue;

		order.push(poppedNode);

		for (const successor of successorsByNodeMap[poppedNode]) {
			indegreeMap[successor]--;

			if (indegreeMap[successor] === 0) {
				queue.enqueue(successor);
			}
		}
	}

	if (Object.keys(indegreeMap).length !== order.length)
		throw new Error("A cycle was detected in the creation order");

	return order;
};
