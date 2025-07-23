import { NextFunction } from "express";
import { AppError } from "./AppError";

export const catchError = (err: unknown, next: NextFunction) => {
	if (err instanceof AppError) {
		return next(err);
	}

	console.error("💥", err);
	return next(
		new AppError(
			500,
			err instanceof Error ? err.message : "Something went very wrong",
		),
	);
};
