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
import { CreateQueryBuilder } from "../../../queries";
import z from "zod";

export const createPostMedia = async (
	poolClient: PoolClient,
	mediaIds: number[],
	createdPostId: number,
): Promise<void> => {
	if (!mediaIds.length) return;

	for (const mediaId of mediaIds) {
		const { query, values } = new CreateQueryBuilder(postMediaTableName)
			.addCreateFields([
				{ key: mediaIdColumnName, value: mediaId },
				{ key: postsIdColumnName, value: createdPostId },
			])
			.build();
		await poolClient.query(query, values);
	}
};

export const createMedia = async (
	poolClient: PoolClient,
	media: z.infer<typeof mediaCreateSchema>[],
	conchId: number,
): Promise<number[]> => {
	if (!media.length) return [];

	const mediaIds: number[] = [];
	for (const mediaObj of media) {
		const { query, values } = new CreateQueryBuilder(mediaTableName)
			.addCreateFields([
				{ key: "storage_key", value: mediaObj.storage_key },
				{ key: "mime_type", value: mediaObj.mime_type },
				{ key: "media_type", value: mediaObj.media_type },
				{ key: conchesIdColumnName, value: conchId },
			])
			.addReturning([mediaIdColumnName])
			.build();
		const result = await poolClient.query(query, values);
		if (!result.rowCount) {
			throw new AppError("Failed to create media", 500);
		}

		mediaIds.push(z.number().parse(result.rows[0][mediaIdColumnName]));
	}

	return mediaIds;
};
