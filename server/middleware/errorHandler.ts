import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";
import { ZodError } from "zod";

export const errorHandler = async (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.log(err);

	if (err instanceof ZodError) {
		return res.status(400).json({ message: err.message });
	} else if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			message: err.message,
		});
	}

	console.error(err);
	return res.status(500).json({
		message: "Internal server error",
	});
};
