import { Pool } from "pg";
import {
	usersCreateSchema,
	usersIdColumnName,
	usersLoginSchema,
	usersSchema,
	usersSignupSchema,
	usersTableName,
	usersUpdateSchema,
} from "../../schemas";
import { NextFunction, Request, Response } from "express";
import format from "pg-format";
import { checkPassword, createPasswordHash } from "../../utils";
import { AppError } from "../../errors";

export const signupUser =
	(dbPool: Pool) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			const { password, ...payload } = usersSignupSchema.parse(req.body);
			const passwordHash = await createPasswordHash(password);
			const passwordHashInjectedPayload = usersCreateSchema.parse({
				...payload,
				password_hash: passwordHash,
			});

			const columns = Object.keys(passwordHashInjectedPayload);
			const values = Object.values(passwordHashInjectedPayload);
			const placeholders = values.map((_, i) => `$${i + 1}`);

			const signupRes = await dbPool.query(
				`INSERT INTO ${usersTableName}
   				(${columns.join(", ")})
   				VALUES (${placeholders.join(", ")})
   				RETURNING *`,
				values,
			);
			const { user_id, app_role, ..._userDbRes } = usersSchema.parse(
				signupRes.rows[0],
			);

			req.user = {
				user_id,
				app_role,
				serverIds: [],
			};

			return next();
		} catch (err) {
			return next(err);
		}
	};

export const loginUser =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = usersLoginSchema.parse(req.body);
			const userRes = await dbPool.query(
				`
				SELECT * FROM ${usersTableName} 
				WHERE email = $1`,
				[email],
			);

			if (!userRes.rowCount)
				throw new AppError("Could not find user with those credentials", 404);

			const { user_id, app_role, password_hash, ..._userDbRes } =
				usersSchema.parse(userRes.rows[0]);

			const isPasswordCorrect = await checkPassword(password, password_hash);
			if (!isPasswordCorrect) throw new AppError("Incorrect credentials", 401);

			req.user = {
				user_id,
				app_role,
				serverIds: [],
			};

			return next();
		} catch (err) {
			return next(err);
		}
	};

export const retrieveUser =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userRes = await dbPool.query(
				`
				SELECT * FROM ${usersTableName} 
				WHERE ${usersIdColumnName} = $1`,
				[req.user![usersIdColumnName]],
			);
			if (!userRes.rowCount) throw new AppError("Could not retrieve user", 404);

			const { password_hash: _password_hash, ...user } = usersSchema.parse(
				userRes.rows[0],
			);

			return res.status(200).json(user);
		} catch (err) {
			return next(err);
		}
	};

export const patchUser =
	(dbPool: Pool) => async (req: Request, res: Response, next: NextFunction) => {
		try {
			const payload = usersUpdateSchema.parse(req.body);
			const keys = Object.keys(payload);
			const keysPlaceholder = keys.map(() => "%I");

			const values = Object.values(payload);
			const valuesPlaceholder = keys.map(() => "%L");
			if (!keys.length || !values.length)
				throw new AppError("No fields provided to update", 400);

			const formattedQuery = format(
				`UPDATE %I
   				SET (${keysPlaceholder.join(", ")}) = (${valuesPlaceholder.join(", ")})
   				WHERE %I = %L
   				RETURNING *`,
				usersTableName,
				...keys,
				...values,
				usersIdColumnName,
				req.user![usersIdColumnName],
			);

			const patchRes = await dbPool.query(formattedQuery);
			const updatedUser = usersSchema.parse(patchRes.rows[0]);
			const { password_hash: _password_hash, ...patchedUser } = updatedUser;

			return res.status(200).json(patchedUser);
		} catch (err) {
			return next(err);
		}
	};
