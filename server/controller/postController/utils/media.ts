import { PoolClient } from "pg";
import {
	conchesIdColumnName,
	mediaCreateSchema,
	mediaIdColumnName,
	mediaTableName,
	postMediaTableName,
	postsIdColumnName,
} from "../../../schemas";
import { AppError } from "../../../errors";
import z from "zod";

export const createPostMedia = async (
	poolClient: PoolClient,
	mediaIds: number[],
	createdPostId: number,
): Promise<void> => {
	if (!mediaIds.length) return;

	const placeholders = mediaIds
		.map((_, index) => {
			const offset = index * 2;
			return `($${offset + 1}, $${offset + 2})`;
		})
		.join(", ");

	const values = mediaIds.flatMap((mediaId) => [mediaId, createdPostId]);

	await poolClient.query(
		`
        INSERT INTO ${postMediaTableName} (
            ${mediaIdColumnName},
            ${postsIdColumnName}
        )
        VALUES ${placeholders};
        `,
		values,
	);
};

export const createMedia = async (
	poolClient: PoolClient,
	media: z.infer<typeof mediaCreateSchema>[],
	conchId: number,
): Promise<number[]> => {
	if (!media.length) return [];

	const placeholders = media
		.map((_, index) => {
			const offset = index * 4;

			return `(
                $${offset + 1},
                $${offset + 2},
                $${offset + 3},
                $${offset + 4}
            )`;
		})
		.join(", ");
	const values = media.flatMap((mediaObj) => [
		mediaObj.storage_key,
		mediaObj.mime_type,
		mediaObj.media_type,
		conchId,
	]);

	const result = await poolClient.query(
		`
        INSERT INTO ${mediaTableName} (
            storage_key,
            mime_type,
            media_type,
			${conchesIdColumnName}
        )
        VALUES ${placeholders}
        RETURNING ${mediaIdColumnName};
        `,
		values,
	);
	if (!result.rowCount) {
		throw new AppError("Failed to create media", 500);
	}

	return result.rows.map((row) => z.number().parse(row[mediaIdColumnName]));
};
