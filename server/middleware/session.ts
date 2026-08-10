import {
	CookieOptions,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import { Pool } from "pg";
import {
	Sessions,
	sessionsSchema,
	sessionsTableName,
	sessionsIdColumnName,
	usersIdColumnName,
	usersSchema,
} from "../schemas";
import { createHash, randomBytes } from "node:crypto";
import format from "pg-format";
import { appEnvVariables, daysToMs } from "../utils";
import { getAllUsersConches } from "../queries";

const EXPIRE_TIME_NUM_DAYS = 30;
const ABSOLUTE_EXPIRE_TIME_NUM_DAYS = 90;
const SESSION_COOKIE_TOKEN_NAME = "session_token";
const SESSION_COOKIE_CONFIG: CookieOptions = {
	httpOnly: true,
	secure: appEnvVariables.nodeEnv === "production",
	sameSite: "lax",
};

const hashSessionToken = (token: string) =>
	createHash("sha256").update(token).digest("hex");

export const createSession =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionToken = randomBytes(32).toString("hex");
			const tokenHash = hashSessionToken(sessionToken);
			const sessionPayload: Omit<Sessions, typeof sessionsIdColumnName> = {
				session_token_hash: tokenHash,
				user_id: req.user![usersIdColumnName],
				expire_time: new Date(Date.now() + daysToMs(EXPIRE_TIME_NUM_DAYS)),
				absolute_expire_time: new Date(
					Date.now() + daysToMs(ABSOLUTE_EXPIRE_TIME_NUM_DAYS),
				),
			};

			const columns = Object.keys(sessionPayload);
			const values = Object.values(sessionPayload);

			const formattedCreateSessionQuery = format(
				`INSERT INTO %I (%I) VALUES (%L) RETURNING *`,
				sessionsTableName,
				columns,
				values,
			);
			const createSessionRes = await dbPool.query(formattedCreateSessionQuery);
			if (!createSessionRes.rowCount) {
				throw new Error("Failed to create session");
			}

			res.cookie(SESSION_COOKIE_TOKEN_NAME, sessionToken, {
				...SESSION_COOKIE_CONFIG,
				maxAge: daysToMs(EXPIRE_TIME_NUM_DAYS),
			});

			return res.status(200).json({ message: "Session successfully created" });
		} catch (err: unknown) {
			next(err);
		}
	};

export const verifySession =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionToken = req.cookies.session_token;
			if (!sessionToken) {
				return res
					.status(404)
					.json({ message: "There is no attached session to authorize" });
			}
			const tokenHash = hashSessionToken(sessionToken);

			const queryRes = await dbPool.query(
				`SELECT
     		row_to_json(sessions) AS session,
     		row_to_json(users) AS user
   			FROM sessions
   			JOIN users
     		ON sessions.user_id = users.id
   			WHERE sessions.session_token_hash = $1`,
				[tokenHash],
			);
			if (!queryRes.rowCount) {
				return res.status(404).json({ message: "Invalid session" });
			}
			const session = sessionsSchema.parse(queryRes.rows[0].session);
			const user = usersSchema.parse(queryRes.rows[0].user);

			if (
				session.expire_time <= new Date() ||
				session.absolute_expire_time <= new Date()
			) {
				return res.status(404).json({ message: "Session expired" });
			}
			const refreshedSessionExpireTimeSeconds = Math.min(
				Date.now() + daysToMs(EXPIRE_TIME_NUM_DAYS),
				session.absolute_expire_time.getTime(),
			);
			const refreshedSessionExpireTimeDate = new Date(
				refreshedSessionExpireTimeSeconds,
			);
			const refreshExpireTimeRes = await dbPool.query(
				`
  			UPDATE ${sessionsTableName}
  			SET expire_time = $1
  			WHERE ${sessionsIdColumnName} = $2
  			`,
				[refreshedSessionExpireTimeDate, session[sessionsIdColumnName]],
			);
			if (!refreshExpireTimeRes.rowCount)
				return res.status(500).json({ message: "Could not refresh session" });

			const usersConches = await getAllUsersConches(
				dbPool,
				user[usersIdColumnName],
			);

			req.user = {
				user_id: user[usersIdColumnName],
				app_role: user.app_role,
				serverIds: usersConches,
			};

			next();
		} catch (err: unknown) {
			next(err);
		}
	};

export const revokeSession =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const sessionToken = req.cookies.session_token;
			if (sessionToken) {
				const sessionTokenHash = hashSessionToken(sessionToken);

				await dbPool.query(
					`DELETE FROM ${sessionsTableName}
         WHERE session_token_hash = $1`,
					[sessionTokenHash],
				);
			}
			res.clearCookie(SESSION_COOKIE_TOKEN_NAME, {
				...SESSION_COOKIE_CONFIG,
			});

			return res.status(200).json({
				message: "Session successfully revoked",
			});
		} catch (err: unknown) {
			next(err);
		}
	};
