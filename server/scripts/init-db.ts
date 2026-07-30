import { dependencyEdges, nodeToCreationQueryMap } from "../schemas";
import Queue from "mnemonist/queue";
import dotenv from "dotenv";
import { AWSSecretStore } from "../secrets";
import { ConchDBPoolClient } from "../db";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { loadEnvVariables } from "../utils";

dotenv.config({ path: "../config.env" });

const determineTopologicalOrderingOfTableCreation = (): string[] | null => {
	const order: string[] = [];

	const preReqMap: Record<string, string[]> = {};
	const indegreeMap: Record<string, number> = {};
	for (const node of Object.keys(nodeToCreationQueryMap)) {
		preReqMap[node] = [];
		indegreeMap[node] = 0;
	}

	for (const [sucessor, preReq] of dependencyEdges) {
		indegreeMap[sucessor]++;
		preReqMap[preReq].push(sucessor);
	}

	const queue = new Queue<string>();
	for (const [node, numPreReqs] of Object.entries(indegreeMap)) {
		if (numPreReqs === 0) queue.enqueue(node);
	}

	while (queue.size) {
		const poppedNode = queue.dequeue();
		if (!poppedNode) continue;

		order.push(poppedNode);

		for (const successor of preReqMap[poppedNode]) {
			indegreeMap[successor]--;

			if (indegreeMap[successor] === 0) {
				queue.enqueue(successor);
			}
		}
	}

	if (Object.keys(indegreeMap).length !== order.length) return null;

	return order;
};

const injectTablesIntoDB = async (): Promise<void> => {
	const creationOrder = determineTopologicalOrderingOfTableCreation();
	if (!creationOrder)
		throw new Error("There was a cycle in the creation order");

	const {
		secretId,
		accessKeyId,
		secretAccessKey,
		db,
		host,
		rdsPortStr,
		region,
		caCertPath,
	} = loadEnvVariables();

	const secretsClient = new SecretsManagerClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});
	const awsSecretStore = new AWSSecretStore(secretsClient, { secretId });

	const dbPool = new ConchDBPoolClient(
		{
			db,
			host,
			rdsPortStr,
			region,
			caCertPath,
		},
		awsSecretStore,
	);
};

await injectTablesIntoDB();
