import {
	conchesIdColumnName,
	mediaIdColumnName,
	mediaTableName,
	membersIdColumnName,
	membersTableName,
	postMediaTableName,
	postMembersTableName,
	postsIdColumnName,
	postsTableName,
} from "../../../schemas";

export const createHydratedPostsQuery = (whereClause: string) => `
				SELECT
					p.${postsIdColumnName},
					p.author_id,
					p.title,
					p.created_at,
					p.body_text,
					p.location,
					p.date,

					COALESCE(
						(
							SELECT JSON_AGG(
								JSON_BUILD_OBJECT(
									'first_name', m.first_name,
									'last_name', m.last_name,
									'photo',
										CASE
											WHEN photo.${mediaIdColumnName} IS NULL THEN NULL
											ELSE JSON_BUILD_OBJECT(
												'storage_key', photo.storage_key,
												'mime_type', photo.mime_type,
												'media_type', photo.media_type
											)
										END
								)
							)
							FROM ${postMembersTableName} AS pm
							JOIN ${membersTableName} AS m
								ON pm.${membersIdColumnName} = m.${membersIdColumnName}
							LEFT JOIN ${mediaTableName} AS photo
								ON m.photo_id = photo.${mediaIdColumnName}
							WHERE pm.${postsIdColumnName} = p.${postsIdColumnName}
						),
						'[]'::json
					) AS members,

					COALESCE(
						(
							SELECT JSON_AGG(
								JSON_BUILD_OBJECT(
									'storage_key', media.storage_key,
									'mime_type', media.mime_type,
									'media_type', media.media_type
								)
							)
							FROM ${postMediaTableName} AS pm
							JOIN ${mediaTableName} AS media
								ON pm.${mediaIdColumnName} = media.${mediaIdColumnName}
							WHERE pm.${postsIdColumnName} = p.${postsIdColumnName}
						),
						'[]'::json
					) AS media

				FROM ${postsTableName} AS p

				${whereClause};
			`;

export const getHydratedPostQuery = createHydratedPostsQuery(`
				WHERE p.${postsIdColumnName} = $1
				AND p.${conchesIdColumnName} = $2
			`);

export const getHydratedPostsQuery = createHydratedPostsQuery(`
				WHERE p.${conchesIdColumnName} = $1
				ORDER BY p.created_at DESC
			`);
