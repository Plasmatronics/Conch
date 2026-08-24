import { PoolClient } from "pg";
import { postMembersTableName, postsIdColumnName } from "../../../schemas";
import { createHydratedPostsQuery } from "./posts";

export const getMemberHydratedPostsQuery = createHydratedPostsQuery(`
    WHERE p.conch_id = $1
    AND EXISTS (
        SELECT 1
        FROM ${postMembersTableName} AS filter_pm
        WHERE filter_pm.post_id = p.${postsIdColumnName}
        AND filter_pm.member_id = $2
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
            member_id,
            post_id
        )
        VALUES ${placeholders};
        `,
		values,
	);
};
