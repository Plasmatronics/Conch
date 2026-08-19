import { Pool } from "pg";
import {
	Conches,
	conchesIdColumnName,
	conchesSchema,
	conchesTableName,
} from "../schemas";

export const getConchFromDb = async (
	dbPool: Pool,
	conch_id: number,
): Promise<Conches | null> => {
	const getConchRes = await dbPool.query(
		`SELECT * FROM ${conchesTableName} WHERE ${conchesIdColumnName} = $1`,
		[conch_id],
	);

	if (!getConchRes.rowCount) return null;
	return conchesSchema.parse(getConchRes.rows[0]);
};
