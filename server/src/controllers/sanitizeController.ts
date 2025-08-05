import { Request, Response, NextFunction } from "express";
import { AppError, sanitize, catchError } from "../utils";

const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
	try {
		const methodsWithBody = ["POST", "PATCH", "DELETE", "PUT"];

		//If there's no body, performantly skip body sanitization
		if (methodsWithBody.includes(req.method)) {
			req.body = sanitize(req.body);

			if (req.body === null) {
				throw new AppError(
					400,
					"Couldn't properly sanitize request. Please try again.",
				);
			}
		}

		const sanitizedParams = sanitize(req.params);
		const sanitizedQuery = sanitize(req.query);

		if (sanitizedParams === null || sanitizedQuery === null) {
			throw new AppError(
				500,
				"Couldn't properly sanitize request. Please try again.",
			);
		}

		// In express@5, req.params and req.query are getters only — can't reassign, but can mutate them
		Object.assign(req.params, sanitizedParams);
		Object.assign(req.query, sanitizedQuery);
		next();
	} catch (err: unknown) {
		catchError(err, next);
	}
};

export const sanitizeController = { sanitizeInput };
