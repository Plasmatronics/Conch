import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils";

const sendErrorDev = (err: Error | AppError, req: Request, res: Response) => {
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err instanceof AppError ? err.statusCode : 500).json({
			status: err instanceof AppError ? err.status : "error",
			message: err.message,
			stack: err.stack,
			error: err,
		});
	}

	res.status(500).send("Something went wrong. Please try again later.");
};

const sendErrorProd = (err: Error | AppError, req: Request, res: Response) => {
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err instanceof AppError ? err.statusCode : 500).json({
			status: err instanceof AppError ? err.status : "error",
			message: err.message,
		});
	}

	res.status(500).send("Something went wrong. Please try again later.");
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
