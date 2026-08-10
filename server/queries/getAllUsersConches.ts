import { Pool } from "pg";
import { claimsSchema, claimsTableName } from "../schemas";
import z from "zod";

export const getAllUsersConches = async (
	dbPool: Pool,
	user_id: number,
): Promise<number[]> => {
	try {
		const claimsRes = await dbPool.query(
			`
		SELECT * FROM ${claimsTableName} WHERE user_id = $1`,
			[user_id],
		);
		const claims = z.array(claimsSchema).parse(claimsRes.rows);

		const conches = claims.map((claim) => claim.conch_id);
		return conches;
	} catch (err) {
		throw new Error(
			`An error has occurred while retrieve conch membership of the user: ${err instanceof Error ? err.message : "an unknown error has occurred"}`,
		);
	}
};
