import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";

export const errorHandler = async (
	err: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	return res.status(err.statusCode).json({
		message: err.message,
	});
};
