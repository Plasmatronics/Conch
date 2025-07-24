import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, UserDoc } from "../models";
import { AppError, catchError } from "../utils";
import mongoose from "mongoose";

const signToken = async (id: mongoose.Types.ObjectId) => {
	return await new Promise((resolve, reject) => {
		jwt.sign(
			{ id },
			process.env.JWT_SECRET || "",
			{
				expiresIn: Number(process.env.JWT_EXPIRES_IN) || "1hr",
			},
			(err, token) => {
				if (err || !token) {
					return reject(
						new AppError(500, "Could not sign token. Please retry action!"),
					);
				}
				resolve(token);
			},
		);
	});
};

const decodeJWT = async (jwtString: string) => {
	return await new Promise((resolve, reject) => {
		jwt.verify(jwtString, process.env.JWT_SECRET || "", (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					return reject(
						new AppError(401, "Token expired. Please login again!"),
					);
				}
				if (err.name === "JsonWebTokenError") {
					return reject(
						new AppError(400, "Invalid token. Please login again!"),
					);
				}
				return reject(new AppError(500, "Token verification failed."));
			}
			resolve(decoded);
		});
	});
};

const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;

		const user: UserDoc | (Omit<UserDoc, "password"> & { password?: string }) =
			await User.findOne({ email: email }).select("+password email");

		if (!user || !(await bcrypt.compare(user.password!, password))) {
			throw new AppError(401, "Invalid login information provided.");
		}

		const jwt = await signToken(user._id as mongoose.Types.ObjectId);
		if (!jwt) throw new AppError(500, "could not create jwt, please try again");
		delete user.password;

		res.cookie("jwt", jwt, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			expires: new Date(Date.now() + 60 * 60 * 1000),
		});

		res.status(200).json({
			status: "success",
			data: user,
		});
	} catch (err: unknown) {
		catchError(err, next);
	}
};

const protect = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.jwt)
			throw new AppError(400, "Not authorized. Please login.");

		const decodedPayload = await decodeJWT(String(req.cookies.jwt));
		const decodedId: string = (decodedPayload as { id: string }).id;

		if (!decodedId)
			throw new AppError(401, "could not verify jwt, please login again");

		const user = await User.findById(decodedId);
		if (!user)
			throw new AppError(401, "could not verify account, please login again.");
		req.user = user;

		next();
	} catch (err: unknown) {
		catchError(err, next);
	}
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password, passwordConfirm } = req.body;

		const user = await User.create({ name, email, password, passwordConfirm });
		if (!user) throw new AppError(400, "Could not signup. Please try again.");

		const jwt = await signToken(user._id as mongoose.Types.ObjectId);
		res.cookie("jwt", jwt, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			expires: new Date(Date.now() + 60 * 60 * 1000),
		});

		res.status(201).json({
			status: "success",
			data: user,
		});
	} catch (err) {
		catchError(err, next);
	}
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.cookie("jwt", "logged-out-cookie", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 0,
		});
		res.status(200).json({
			status: "success",
		});
	} catch (err) {
		catchError(err, next);
	}
};

export const authController = {
	login,
	protect,
	signup,
	logout,
};
