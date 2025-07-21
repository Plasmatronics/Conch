import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils";

const sendErrorDev = (err: Error | AppError, req: Request, res: Response) => {
	if (req.originalUrl.startsWith("/api")) {
		if (err instanceof AppError) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}

		//if not operational don't leak details
		console.error("ERROR 💥", err);
		return res.status(500).json({
			status: "error",
			message: err.message,
			stack: err.stack,
			error: err,
		});
	}
};

const sendErrorProd = (err: Error | AppError, req: Request, res: Response) => {
	if (req.originalUrl.startsWith("/api")) {
		if (err instanceof AppError && err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
				error: err,
				stack: err.stack,
			});
		}

		console.error("ERROR 💥", err);
		return res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	}
};

export const globalErrorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_: NextFunction,
) => {
	if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);
	if (process.env.NODE_ENV === "production") sendErrorProd(err, req, res);
};
