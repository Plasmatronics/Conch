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
import { checkPassword, createPasswordHash } from "../../utils";
import { AppError } from "../../errors";
import {
	CreateQueryBuilder,
	ReadQueryBuilder,
	UpdateQueryBuilder,
} from "../../queries";

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

			const { query, values } = new CreateQueryBuilder(usersTableName)
				.addCreateFields(
					Object.entries(passwordHashInjectedPayload).map(([key, value]) => {
						return {
							key,
							value,
						};
					}),
				)
				.addReturning(["*"])
				.build();
			const signupRes = await dbPool.query(query, values);
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
			const { query, values } = new ReadQueryBuilder(usersTableName)
				.addConditions([
					{
						key: "email",
						operator: "=",
						value: email,
					},
				])
				.build();
			const userRes = await dbPool.query(query, values);

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
			const { query, values } = new ReadQueryBuilder(usersTableName)
				.addConditions([
					{
						key: usersIdColumnName,
						operator: "=",
						value: req.user![usersIdColumnName],
					},
				])
				.build();
			const userRes = await dbPool.query(query, values);
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
			const { query, values } = new UpdateQueryBuilder(usersTableName)
				.addConditions([
					{
						key: usersIdColumnName,
						operator: "=",
						value: req.user![usersIdColumnName],
					},
				])
				.addUpdateFields(
					Object.entries(payload).map(([key, value]) => {
						return {
							key,
							value,
						};
					}),
				)
				.addReturning(["*"])
				.build();

			const patchRes = await dbPool.query(query, values);
			const updatedUser = usersSchema.parse(patchRes.rows[0]);
			const { password_hash: _password_hash, ...patchedUser } = updatedUser;

			return res.status(200).json(patchedUser);
		} catch (err) {
			return next(err);
		}
	};
