import { PoolClient } from "pg";
import {
	membersIdColumnName,
	postMembersTableName,
	postsIdColumnName,
} from "../../../schemas";
import { CreateQueryBuilder } from "../../../queries";
import { createHydratedPostsQuery } from "./posts";

export const getMemberHydratedPostsQuery = createHydratedPostsQuery(`
    WHERE p.conch_id = $1
    AND EXISTS (
        SELECT 1
        FROM ${postMembersTableName} AS filter_pm
        WHERE filter_pm.${postsIdColumnName} = p.${postsIdColumnName}
        AND filter_pm.${membersIdColumnName} = $2
    )
    ORDER BY p.created_at DESC
`);

export const createPostMembers = async (
	poolClient: PoolClient,
	memberIds: number[],
	createdPostId: number,
): Promise<void> => {
	if (!memberIds.length) return;

	for (const memberId of memberIds) {
		const { query, values } = new CreateQueryBuilder(postMembersTableName)
			.addCreateFields([
				{ key: membersIdColumnName, value: memberId },
				{ key: postsIdColumnName, value: createdPostId },
			])
			.build();
		await poolClient.query(query, values);
	}
};
