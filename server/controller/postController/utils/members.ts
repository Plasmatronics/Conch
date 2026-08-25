import { PoolClient } from "pg";
import {
	membersIdColumnName,
	postMembersTableName,
	postsIdColumnName,
} from "../../../schemas";
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

	const placeholders = memberIds
		.map((_, index) => {
			const offset = index * 2;
			return `($${offset + 1}, $${offset + 2})`;
		})
		.join(", ");

	const values = memberIds.flatMap((memberId) => [memberId, createdPostId]);

	await poolClient.query(
		`
        INSERT INTO ${postMembersTableName} (
            ${membersIdColumnName},
            ${postsIdColumnName}
        )
        VALUES ${placeholders};
        `,
		values,
	);
};
