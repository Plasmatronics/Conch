import { Pool } from "pg";
import {
	Conches,
	conchesIdColumnName,
	conchesSchema,
	conchesTableName,
} from "../schemas";
import { ReadQueryBuilder } from "./QueryBuilders";

export const getConchFromDb = async (
	dbPool: Pool,
	conch_id: number,
): Promise<Conches | null> => {
	const { query, values } = new ReadQueryBuilder(conchesTableName)
		.addConditions([
			{ key: conchesIdColumnName, operator: "=", value: conch_id },
		])
		.build();
	const getConchRes = await dbPool.query(query, values);

	if (!getConchRes.rowCount) return null;
	return conchesSchema.parse(getConchRes.rows[0]);
};
