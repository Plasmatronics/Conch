import { NextFunction } from "express";
import { AppError } from "./AppError";

/**
 * catchError is a wrapper to reduce boilerplate in catch blocks.
 */

export const catchError = (err: unknown, next: NextFunction) => {
	if (err instanceof AppError) {
		return next(err);
	}

	return next(
		new AppError(
			500,
			err instanceof Error ? err.message : "Something went very wrong",
		),
	);
};
