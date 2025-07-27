import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User, UserDoc } from "../models";
import { AppError, catchError, Email } from "../utils";
import mongoose from "mongoose";
import crypto from "crypto";

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

const sendSignupEmail = async (email: IUser["email"]) => {
	try {
		await Email.getEmail().sendGreetingEmail(email);
	} catch (err) {
		rollbackUser(email);
		throw err;
	}
};

const rollbackUser = async (email: IUser["email"]) => {
	try {
		await User.deleteOne({ email });
	} catch (err) {
		throw new AppError(
			500,
			err instanceof Error
				? err.message
				: "Could not rollback user. Please try signup again.",
		);
	}
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password, passwordConfirm } = req.body;

		const user = await User.create({ name, email, password, passwordConfirm });
		if (!user) throw new AppError(400, "Could not signup. Please try again.");

		await sendSignupEmail(user.email);

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

const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;

		const user: UserDoc | (Omit<UserDoc, "password"> & { password?: string }) =
			await User.findOne({ email }).select("+password email");

		if (!user || !(await user.isPasswordCorrect(password))) {
			throw new AppError(401, "Invalid login information provided.");
		}

		const jwt = await signToken(user._id as mongoose.Types.ObjectId);
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
			throw new AppError(401, "Could not verify jwt, please login again");

		const user = await User.findById(decodedId);
		if (!user)
			throw new AppError(401, "Could not verify account, please login again.");
		req.user = user;

		next();
	} catch (err: unknown) {
		catchError(err, next);
	}
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		res.clearCookie("jwt", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});
		res.status(200).json({
			status: "success",
		});
	} catch (err) {
		catchError(err, next);
	}
};

const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (user) {
			const resetToken = user.createResetPasswordToken();
			await user.save({ validateBeforeSave: false });

			const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;

			await Email.getEmail().sendPasswordResetEmail(email, resetUrl);
		}

		res.status(200).json({
			status: "success",
			message:
				"If an acccount is associated with this email, an email will be sent to your inbox with a link to reset your password.",
		});
	} catch (err) {
		catchError(err, next);
	}
};

const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { token } = req.params;
		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const { password, passwordConfirm } = req.body;

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpiresAt: { $gt: Date.now() },
		});

		if (!user)
			throw new AppError(
				400,
				"Could not reset password, please request another email.",
			);

		user.password = password;
		user._passwordConfirm = passwordConfirm;
		user.passwordResetToken = undefined;
		user.passwordResetExpiresAt = undefined;
		await user.save();

		res
			.status(200)
			.json({ status: "success", message: "Password successfully reset." });
	} catch (err) {
		catchError(err, next);
	}
};

export const authController = {
	login,
	protect,
	signup,
	logout,
	forgotPassword,
	resetPassword,
};
